import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook signature (in a production environment)
    // const signature = request.headers.get('x-signature');
    // if (!validateSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Process the webhook data
    if (body.type === 'payment' && body.data) {
      const paymentId = body.data.id;
      
      // Update the support record with the payment status
      const { data, error } = await supabase
        .from('supports')
        .update({ 
          payment_status: 'completed',
          payment_id: paymentId
        })
        .eq('payment_id', paymentId)
        .select();

      if (error) {
        console.error('Error updating support payment status:', error);
        return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// For validation in production
// function validateSignature(signature: string | null, body: any): boolean {
//   if (!signature) return false;
//   // Implement signature validation logic
//   return true;
// }