import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

// Armazenar o QR Code mais recente para cada sessão
const qrCodes = new Map<string, { qr: string; timestamp: number; qrImage: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log do webhook recebido
    console.log('🌐 Webhook recebido no frontend:');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Processar apenas eventos relacionados ao QR Code e status de conexão
    if (body.dataType) {
      console.log(`🎯 Tipo de evento: ${body.dataType}`);
      
      switch (body.dataType) {
        case 'ready':
          console.log('✅ WhatsApp conectado e pronto - Removendo QR Code');
          if (body.sessionId) {
            // Remover QR Code quando conectado
            qrCodes.delete(body.sessionId);
            console.log(`🗑️ QR Code removido para sessão: ${body.sessionId}`);
            console.log(`📊 Total de QR Codes ativos: ${qrCodes.size}`);
          }
          break;
          
        case 'authenticated':
          console.log('🔐 Autenticado com sucesso - Removendo QR Code');
          if (body.sessionId) {
            // Remover QR Code quando autenticado
            qrCodes.delete(body.sessionId);
            console.log(`🗑️ QR Code removido para sessão: ${body.sessionId}`);
            console.log(`📊 Total de QR Codes ativos: ${qrCodes.size}`);
          }
          break;
          
        case 'disconnected':
          console.log('❌ Desconectado - QR Code pode ser necessário novamente');
          // Não remover QR Code aqui, pois pode ser necessário reconectar
          break;
          
        case 'loading_screen':
          console.log('🔄 Carregando tela - Mantendo QR Code se existir');
          break;
          
        case 'qr':
          console.log('📱 QR Code gerado - Armazenando para exibição');
          if (body.data?.qr && body.sessionId) {
            try {
              // Gerar imagem QR Code a partir dos dados
              const qrImageDataUrl = await QRCode.toDataURL(body.data.qr, {
                width: 256,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });
              
              // Armazenar o QR Code com timestamp e imagem
              qrCodes.set(body.sessionId, {
                qr: body.data.qr,
                timestamp: Date.now(),
                qrImage: qrImageDataUrl
              });
              console.log(`✅ QR Code armazenado para sessão: ${body.sessionId}`);
              console.log(`📊 Total de QR Codes ativos: ${qrCodes.size}`);
            } catch (qrError) {
              console.error('❌ Erro ao gerar imagem QR Code:', qrError);
            }
          }
          break;
          
        default:
          // Ignorar outros tipos de eventos
          console.log(`📝 Evento ignorado: ${body.dataType}`);
      }
    }
    
    // Log da sessão
    if (body.sessionId) {
      console.log(`🆔 Sessão: ${body.sessionId}`);
    }
    
    console.log('---');
    
    // Retornar sucesso
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      timestamp: new Date().toISOString(),
      eventType: body.dataType,
      sessionId: body.sessionId
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar webhook' 
      },
      { status: 500 }
    );
  }
}

// Endpoint para a página buscar o QR Code atual
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'sessionId é obrigatório' 
      },
      { status: 400 }
    );
  }
  
  const qrData = qrCodes.get(sessionId);
  
  if (!qrData) {
    return NextResponse.json({
      success: true,
      hasQR: false,
      message: 'Nenhum QR Code disponível para esta sessão'
    });
  }
  
  // Verificar se o QR Code não está expirado (mais de 2 minutos)
  const isExpired = Date.now() - qrData.timestamp > (2 * 60 * 1000) + 3000;
  
  if (isExpired) {
    qrCodes.delete(sessionId);
    return NextResponse.json({
      success: true,
      hasQR: false,
      message: 'QR Code expirado'
    });
  }
  
  return NextResponse.json({
    success: true,
    hasQR: true,
    qr: qrData.qr,
    qrImage: qrData.qrImage,
    timestamp: qrData.timestamp,
    message: 'QR Code disponível'
  });
}
