import { NextRequest, NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, supportData, recipientId } = body;

    if (!amount || !supportData || !recipientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Create a new support record with pending payment status
    const { data: supportRecord, error: supportError } = await supabase
      .from('supports')
      .insert({
        supporter_id: user?.id || null,
        recipient_id: recipientId,
        addiction_id: supportData.addictionId || null,
        goal_id: supportData.goalId || null,
        message: supportData.message,
        duration: parseInt(supportData.duration),
        amount: amount,
        supporter_name: supportData.supporterName || null,
        hide_amount: supportData.hideAmount,
        payment_status: 'pending',
        completed: false
      })
      .select()
      .single();

    if (supportError) {
      console.error('Error creating support record:', supportError);
      return NextResponse.json(
        { error: 'Failed to create support record' },
        { status: 500 }
      );
    }

    // Get recipient information for the payment description
    const { data: recipient } = await supabase
      .from('users')
      .select('name, username')
      .eq('id', recipientId)
      .single();

    // Create Mercado Pago preference
    const preference = await createPreference({
      items: [
        {
          id: supportRecord.id,
          title: `Apoio para ${recipient?.name || 'usuário'}`,
          quantity: 1,
          unit_price: parseFloat(amount),
          description: `Apoio de ${supportData.duration} dias para ${recipient?.username || 'usuário'}`
        }
      ],
      payer: {
        name: supportData.supporterName || 'Apoiador anônimo',
        email: user?.email || undefined
      },
      back_urls: {
        success: `${request.nextUrl.origin}/payment/success?support_id=${supportRecord.id}`,
        failure: `${request.nextUrl.origin}/payment/failure?support_id=${supportRecord.id}`,
        pending: `${request.nextUrl.origin}/payment/pending?support_id=${supportRecord.id}`
      },
      auto_return: 'approved',
      external_reference: supportRecord.id,
      notification_url: `${request.nextUrl.origin}/api/mercadopago/webhook`
    });

    // Update the support record with the payment ID
    if (preference.id) {
      await supabase
        .from('supports')
        .update({ payment_id: preference.id })
        .eq('id', supportRecord.id);
    }

    return NextResponse.json({
      preferenceId: preference.id,
      supportId: supportRecord.id
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Failed to create payment preference' },
      { status: 500 }
    );
  }
}
