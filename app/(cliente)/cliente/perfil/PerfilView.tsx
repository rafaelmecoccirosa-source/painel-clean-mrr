'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Eyebrow } from '@/components/landing-v2/shared';
import { COLORS } from '@/lib/brand-tokens';
import { initialsOf } from '@/lib/mock-cliente';
import { createClient } from '@/lib/supabase/client';

type NotifKey = 'lembrete' | 'relatorio' | 'alerta' | 'promocoes';

export type PerfilProps = {
  nome: string;
  email: string;
  cidade: string;
  phone: string;
  plano: string;
  mensalidade: number;
  modulosCount: number;
  potenciaKWp: number;
  inversor: string;
  clienteDesde: string;
  tecnico: string;
  descontoIndicacao: number;
  indicacoesAtivas: number;
  isDemo: boolean;
};

export default function PerfilView({
  nome,
  email,
  cidade,
  phone,
  plano,
  mensalidade,
  modulosCount,
  potenciaKWp,
  inversor,
  clienteDesde,
  tecnico,
  descontoIndicacao,
  isDemo,
}: PerfilProps) {
  const router = useRouter();
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    lembrete: true,
    relatorio: true,
    alerta: true,
    promocoes: false,
  });
  const [editing, setEditing] = useState(false);
  const [editNome, setEditNome] = useState(nome);
  const [editPhone, setEditPhone] = useState(phone || '');
  const [editCidade, setEditCidade] = useState(cidade && cidade !== '—' ? cidade : 'Jaraguá do Sul');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit() {
    setEditNome(nome);
    setEditPhone(phone || '');
    setEditCidade(cidade && cidade !== '—' ? cidade : 'Jaraguá do Sul');
    setEditError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setEditError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEditError('Sua sessão expirou. Faça login novamente.');
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editNome.trim() || null,
          phone:     editPhone.trim() || null,
          city:      editCidade.trim() || null,
        })
        .eq('user_id', user.id);
      if (error) {
        setEditError(error.message);
        setSaving(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setSaving(false);
    }
  }

  const cidadeDisplay = cidade && cidade.trim() && cidade !== '—' ? cidade : 'Jaraguá do Sul';

  return (
    <main className="pc-mobile-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 72px', display: 'grid', gap: 24 }}>
      {isDemo && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 18px', fontSize: 13, color: '#92400E', fontWeight: 600 }}>
          Dados demo — assine um plano para ver seus dados reais
        </div>
      )}

      <div>
        <Eyebrow>Seu perfil</Eyebrow>
        <h1
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.dark,
            margin: '6px 0 0',
            letterSpacing: '-.025em',
          }}
        >
          Dados e preferências
        </h1>
      </div>

      <section
        className="fade-up fade-up-1 pc-mobile-stack"
        style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 24 }}
      >
        {/* Dados pessoais */}
        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 2px 12px rgba(27,58,45,.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 9999,
                background: COLORS.dark,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 800,
                fontSize: 26,
                letterSpacing: '.02em',
              }}
            >
              {initialsOf(nome)}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: COLORS.dark,
                  letterSpacing: '-.02em',
                }}
              >
                {nome}
              </div>
              <div style={{ marginTop: 6 }}>
                <Badge tone="green">Assinante {plano}</Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <FieldRow label="Email" value={email} />
            <FieldRow label="Telefone" value={phone || '—'} />
            <FieldRow label="CPF" value="•••.•••.123-45" />
            <FieldRow
              label="Cidade"
              value={`${cidadeDisplay}, SC`}
            />
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${COLORS.border}` }}>
            <Button variant="secondary" size="md" onClick={openEdit}>
              Editar dados pessoais
            </Button>
          </div>
        </div>

        {/* Minha usina + Assinatura */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div
            style={{
              background: 'white',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 12px rgba(27,58,45,.08)',
            }}
          >
            <Eyebrow>Minha usina</Eyebrow>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <KV label="Módulos" value={modulosCount > 0 ? `${modulosCount} módulos · 550W cada` : '—'} />
              <KV label="Potência" value={potenciaKWp > 0 ? `${potenciaKWp} kWp` : '—'} />
              <KV label="Inversor" value={inversor || '—'} />
              <KV label="Instalação" value="Telhado inclinado" />
              <KV label="API inversor" value={<Badge tone="amber">Em breve</Badge>} />
            </div>
          </div>

          <div
            style={{
              background: 'white',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 12px rgba(27,58,45,.08)',
            }}
          >
            <Eyebrow>Assinatura</Eyebrow>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <KV label="Plano" value={plano !== '—' ? `${plano} · R$ ${mensalidade}/mês` : '—'} />
              <KV label="Cliente desde" value={clienteDesde} />
              <KV label="Técnico fixo" value={tecnico} />
              <KV
                label="Desconto indicação"
                value={
                  descontoIndicacao > 0 ? (
                    <span style={{ color: COLORS.green, fontWeight: 700 }}>
                      {descontoIndicacao}% ativo
                    </span>
                  ) : '—'
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pagamento */}
      <section
        className="fade-up fade-up-2"
        style={{
          background: 'white',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 2px 12px rgba(27,58,45,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 42,
              borderRadius: 8,
              background: `linear-gradient(135deg, #EB001B, #F79E1B)`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: 6,
                bottom: 6,
                fontSize: 8,
                fontWeight: 800,
                color: 'white',
                letterSpacing: '.02em',
              }}
            >
              MC
            </div>
          </div>
          <div>
            <Eyebrow>Forma de pagamento</Eyebrow>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: COLORS.dark,
                marginTop: 4,
              }}
            >
              Mastercard •••• 4782
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Expira 09/2028</div>
          </div>
        </div>
        <Button variant="secondary" size="md">
          Trocar cartão
        </Button>
      </section>

      {/* Notificações */}
      <section
        className="fade-up fade-up-3"
        style={{
          background: 'white',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 2px 12px rgba(27,58,45,.08)',
        }}
      >
        <Eyebrow>Notificações</Eyebrow>
        <h3
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: COLORS.dark,
            margin: '4px 0 18px',
          }}
        >
          O que você quer receber
        </h3>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { k: 'lembrete' as const, label: 'Lembrete de limpeza (3 dias antes)' },
            { k: 'relatorio' as const, label: 'Relatório mensal disponível' },
            { k: 'alerta' as const, label: 'Alerta de queda de geração' },
            { k: 'promocoes' as const, label: 'Promoções e novidades' },
          ].map((row) => (
            <ToggleRow
              key={row.k}
              label={row.label}
              on={notif[row.k]}
              onToggle={() => setNotif((prev) => ({ ...prev, [row.k]: !prev[row.k] }))}
            />
          ))}
        </div>
      </section>

      {editing && (
        <EditModal
          nome={editNome}
          setNome={setEditNome}
          phone={editPhone}
          setPhone={setEditPhone}
          cidade={editCidade}
          setCidade={setEditCidade}
          saving={saving}
          error={editError}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function EditModal({
  nome,
  setNome,
  phone,
  setPhone,
  cidade,
  setCidade,
  saving,
  error,
  onCancel,
  onSave,
}: {
  nome: string;
  setNome: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  cidade: string;
  setCidade: (v: string) => void;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(14, 37, 28, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 16px 48px rgba(0,0,0,.25)',
          display: 'grid',
          gap: 18,
        }}
      >
        <h2
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: COLORS.dark,
            margin: 0,
          }}
        >
          Editar dados pessoais
        </h2>

        <ModalField label="Nome completo">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={modalInputStyle}
          />
        </ModalField>

        <ModalField label="Telefone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(47) 99999-0000"
            style={modalInputStyle}
          />
        </ModalField>

        <ModalField label="Cidade">
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Jaraguá do Sul"
            style={modalInputStyle}
          />
        </ModalField>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <Button variant="secondary" size="md" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 14,
  color: COLORS.dark,
  fontFamily: "'Open Sans',sans-serif",
  outline: 'none',
};

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.muted,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldRow({
  label,
  value,
  action,
}: {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `1px solid ${COLORS.border}`,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.muted,
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 14, color: COLORS.dark, fontWeight: 500 }}>{value}</span>
      </div>
      {action}
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        fontSize: 13,
        gap: 12,
      }}
    >
      <span style={{ color: COLORS.muted }}>{label}</span>
      <span style={{ color: COLORS.dark, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 14, color: COLORS.dark, fontWeight: 500 }}>{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={on}
        style={{
          width: 46,
          height: 26,
          borderRadius: 9999,
          background: on ? COLORS.green : COLORS.border,
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background .2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 23 : 3,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            transition: 'left .2s',
          }}
        />
      </button>
    </div>
  );
}
