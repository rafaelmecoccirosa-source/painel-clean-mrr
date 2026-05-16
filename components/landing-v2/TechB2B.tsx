'use client';

import { Button, COLORS, Particles, SectionHeadline, useIsMobile } from './shared';

export default function TechB2B() {
  const isMobile = useIsMobile(900);

  const cards = [
    {
      icon: '📅',
      title: 'Agenda flexível',
      body: 'Aceite apenas os chamados que cabem na sua rotina. Sem horários impostos.',
    },
    {
      icon: '💸',
      title: 'Pagamento garantido',
      body: 'Cada serviço concluído paga em até 3 dias úteis via PIX. Recibo digital automático.',
    },
    {
      icon: '✅',
      title: 'Cadastro gratuito',
      body: 'Sem taxa de entrada. Faça o curso online de certificação e entre ativo na plataforma.',
    },
    {
      icon: '📍',
      title: 'Chamados na sua região',
      body: 'Algoritmo prioriza técnicos mais próximos do cliente. Menos deslocamento, mais trabalho.',
    },
    {
      icon: '🛡️',
      title: 'Seguro incluso',
      body: 'Cobertura contra danos acidentais durante o serviço. Você trabalha sem medo, cliente confia.',
    },
    {
      icon: '🛠',
      title: 'Ecossistema CleanPass',
      body: 'App com checklist, captura de fotos, assinatura digital e suporte. Você foca no serviço.',
    },
  ];

  return (
    <section
      id="para-tecnicos"
      style={{
        background: '#0F2419',
        color: 'white',
        padding: isMobile ? '72px 20px' : '104px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Particles count={18} color="rgba(61,196,90,0.15)" />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <SectionHeadline
          dark
          eyebrow="👷 PARA TÉCNICOS"
          title={
            <>
              Ganhe renda extra limpando
              <br />
              painéis solares na sua cidade.
            </>
          }
          subtitle="Plataforma de chamados para técnicos certificados. Trabalhe quando quiser, na região que quiser."
        />

        <div
          style={{
            marginTop: isMobile ? 40 : 56,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {cards.map((c, i) => (
            <div
              key={c.title}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(61,196,90,0.2)',
                borderRadius: 16,
                padding: isMobile ? 22 : 28,
                transition: 'all .25s',
                animation: `pc-slideup .5s ${i * 0.06}s ease both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(61,196,90,0.08)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(61,196,90,0.2)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 13,
                  background: 'rgba(61,196,90,0.14)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {c.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-.01em',
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Open Sans',sans-serif",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.72)',
                  margin: '10px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button variant="primary" size="lg" style={{ boxShadow: '0 10px 28px rgba(61,196,90,0.4)' }}>
            Cadastrar como técnico →
          </Button>
          <p
            style={{
              marginTop: 16,
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Processo 100% digital · Certificação NR-35 · Suporte da equipe
          </p>
        </div>
      </div>
    </section>
  );
}
