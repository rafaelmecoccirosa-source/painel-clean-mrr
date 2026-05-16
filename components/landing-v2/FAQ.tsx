'use client';

import { useState } from 'react';
import { Button, COLORS, SectionHeadline, useIsMobile } from './shared';

export default function FAQ() {
  const isMobile = useIsMobile(900);
  const [open, setOpen] = useState(-1);

  const faqs = [
    {
      q: 'A limpeza usa água? Meu telhado aguenta?',
      a: 'Usamos escovas específicas com pouca água desmineralizada — mesma pressão de uma mangueira comum. Sem risco para telhado, estrutura ou selante dos painéis. Técnicos treinados em NR-35.',
    },
    {
      q: 'Como funciona o monitoramento via inversor?',
      a: 'Integramos via API com Growatt, Fronius, Deye, SolarEdge, Sungrow e Hoymiles. Você autoriza uma vez e passamos a ver sua geração em tempo real. Queda de 5%+ dispara chamado automático.',
    },
    {
      q: 'E se a geração cair fora do esperado?',
      a: 'Alerta automático e visita técnica em até 48h. Sujeira: limpeza emergencial inclusa. Problema de inversor ou string: diagnóstico detalhado para acionar garantia do fabricante.',
    },
    {
      q: 'Preciso ficar em casa no dia da limpeza?',
      a: 'Não. Técnico acessa o telhado por escada externa. Você recebe notificação de chegada, progresso e conclusão, mais relatório fotográfico com 12+ fotos antes/depois.',
    },
    {
      q: 'Como funciona o contrato de 12 meses?',
      a: 'Contrato mínimo de 12 meses garante preço congelado e prioridade de agendamento. Após 12 meses você pode cancelar a qualquer momento, sem multa.',
    },
    {
      q: 'E se meu inversor não for compatível?',
      a: 'Compatibilidade nativa com 90% das marcas do Brasil. Fora disso, fazemos monitoramento manual via leitura mensal pelo técnico — o plano funciona igual.',
    },
    {
      q: 'Como funciona o seguro contra danos?',
      a: 'Cobertura até R$ 50.000 por evento contra danos acidentais durante a limpeza. Se algo quebrar — raro, mas acontece — a plataforma cobre. Você não paga, o técnico não paga.',
    },
    {
      q: 'Quais formas de pagamento?',
      a: 'PIX (anual com desconto de 2 meses) ou cartão de crédito recorrente. Todas as bandeiras principais.',
    },
    {
      q: 'Atendem minha cidade?',
      a: '3 cidades ativas (Jaraguá do Sul, Pomerode, Florianópolis) + 4 em expansão + 6 em breve. Não é a sua? Entre na lista de espera — priorizamos regiões com mais pedidos.',
    },
  ];

  return (
    <section
      id="faq"
      style={{
        background: COLORS.bg,
        padding: isMobile ? '56px 20px' : '88px 32px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <SectionHeadline eyebrow="❓ PERGUNTAS FREQUENTES" title="Tudo que você quer saber antes de assinar" />

        <div style={{ marginTop: isMobile ? 32 : 44, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                style={{
                  background: 'white',
                  border: `1px solid ${isOpen ? COLORS.green : COLORS.border}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color .18s',
                  boxShadow: isOpen ? '0 4px 18px rgba(27,58,45,0.08)' : 'none',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: isMobile ? '18px 20px' : '22px 26px',
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 700,
                      fontSize: isMobile ? 15 : 16.5,
                      color: COLORS.dark,
                      letterSpacing: '-.005em',
                      lineHeight: 1.4,
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isOpen ? COLORS.green : COLORS.light,
                      color: isOpen ? 'white' : COLORS.dark,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 20,
                      fontWeight: 700,
                      transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1), background 150ms ease, color 150ms ease',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 250ms cubic-bezier(0.23,1,0.32,1)',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ padding: isMobile ? '0 20px 20px' : '0 26px 24px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'Open Sans',sans-serif",
                          fontSize: isMobile ? 14 : 15,
                          lineHeight: 1.65,
                          color: 'rgba(27,58,45,0.72)',
                          textWrap: 'pretty',
                        }}
                      >
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 32,
            background: COLORS.light,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: isMobile ? '18px 20px' : '20px 26px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 14 : 20,
          }}
        >
          <p
            style={{
              flex: 1,
              margin: 0,
              fontFamily: "'Open Sans',sans-serif",
              fontSize: 14.5,
              lineHeight: 1.5,
              color: COLORS.dark,
            }}
          >
            💬 <strong style={{ fontWeight: 700 }}>Ainda com dúvida?</strong> Fale no WhatsApp — respondemos em até
            10 minutos em horário comercial.
          </p>
          <Button variant="primary" size="md">
            Falar no WhatsApp →
          </Button>
        </div>
      </div>
    </section>
  );
}
