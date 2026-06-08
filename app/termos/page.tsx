import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Termos de Uso | Painel Clean",
  description: "Termos de uso da plataforma Painel Clean — marketplace de limpeza de placas solares.",
};

const LAST_UPDATED = "31 de março de 2026";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-8 shadow-sm space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brand-dark mb-2">
              Termos de Uso
            </h1>
            <p className="text-sm text-brand-muted">
              Última atualização: {LAST_UPDATED} · <em>Documento provisório — será revisado por assessoria jurídica antes do piloto</em>
            </p>
          </div>

          <Section title="1. Sobre a Plataforma">
            <p>
              A Painel Clean Plataforma é um marketplace digital que conecta proprietários de sistemas fotovoltaicos
              ("Clientes") a técnicos especializados em limpeza e manutenção preventiva de módulos solares ("Técnicos").
              A plataforma é operada pela <strong>Painel Clean Ltda</strong> (CNPJ a definir), com sede em
              Jaraguá do Sul, Santa Catarina.
            </p>
          </Section>

          <Section title="2. Aceitação dos Termos">
            <p>
              Ao criar uma conta e utilizar a plataforma, o usuário declara ter lido, compreendido e aceito
              integralmente estes Termos de Uso. Caso não concorde com qualquer disposição, deverá abster-se
              de utilizar os serviços.
            </p>
          </Section>

          <Section title="3. Cadastro e Responsabilidades do Usuário">
            <ul>
              <li>O usuário deve fornecer informações verídicas, completas e atualizadas no cadastro.</li>
              <li>É responsável pela guarda e sigilo de suas credenciais de acesso.</li>
              <li>Cada pessoa física ou jurídica pode manter somente uma conta ativa.</li>
              <li>Menores de 18 anos não podem se cadastrar sem autorização dos responsáveis legais.</li>
            </ul>
          </Section>

          <Section title="4. Proibição de Contato Direto — Regra Anti-Bypass">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
              <p className="text-red-800 font-semibold text-sm">⚠️ Cláusula crítica — leia com atenção</p>
            </div>
            <p>
              <strong>É expressamente proibido</strong> utilizar dados pessoais, informações de localização ou
              quaisquer outros dados obtidos por meio da plataforma para estabelecer contato comercial, contratação
              de serviços ou qualquer relação profissional diretamente com o outro usuário, fora do ambiente
              da plataforma.
            </p>
            <p className="mt-2">
              Isso inclui, mas não se limita a: troca de números de telefone, e-mails, perfis em redes sociais
              ou aplicativos de mensagens (WhatsApp, Telegram, Instagram, etc.), com a finalidade de contratar
              serviços de limpeza solar sem intermediação da plataforma.
            </p>
            <p className="mt-2">
              O descumprimento desta cláusula implica <strong>bloqueio imediato da conta</strong>, sem direito
              a reembolso de valores pagos, e poderá sujeitar o infrator a ação judicial por concorrência desleal
              e violação contratual.
            </p>
          </Section>

          <Section title="5. Modelo Financeiro e Repasses">
            <ul>
              <li>O repasse ao Técnico é fixo em <strong>R$ 13,00 por módulo</strong> limpo, independente do valor total cobrado ao cliente.</li>
              <li>A margem da plataforma é a diferença entre o valor cobrado do cliente e o repasse ao Técnico.</li>
              <li>O repasse é realizado via PIX após a conclusão e confirmação do pagamento pelo cliente.</li>
              <li>Cadastro gratuito para técnicos — sem mensalidade. Pagamento por módulo limpo, sem taxa percentual.</li>
              <li>Os preços dos serviços são definidos pela plataforma e podem ser atualizados com aviso prévio de 30 dias.</li>
            </ul>
          </Section>

          <Section title="6. Pagamentos e Reembolsos">
            <ul>
              <li>O pagamento é realizado antecipadamente via PIX, antes da execução do serviço.</li>
              <li>Cancelamentos solicitados pelo Cliente antes da aceitação pelo Técnico serão reembolsados integralmente em até 5 dias úteis.</li>
              <li>Após a aceitação pelo Técnico, reembolsos ficam sujeitos à análise pela equipe Painel Clean.</li>
              <li>Serviços insatisfatórios estão cobertos pela <strong>Garantia Painel Clean</strong>: uma nova visita gratuita em até 30 dias.</li>
            </ul>
          </Section>

          <Section title="7. Responsabilidades dos Técnicos">
            <ul>
              <li>Devem possuir formação técnica adequada e concluir o treinamento obrigatório da Painel Clean.</li>
              <li>São responsáveis pela qualidade do serviço prestado e pelas ferramentas/equipamentos utilizados.</li>
              <li>Devem registrar relatório fotográfico (antes e depois) para cada serviço concluído.</li>
              <li>Avaliações abaixo de 3 estrelas em 3 serviços consecutivos podem resultar em suspensão da conta.</li>
            </ul>
          </Section>

          <Section title="8. Privacidade e Proteção de Dados (LGPD)">
            <p>
              A Painel Clean trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              Os dados coletados são utilizados exclusivamente para: (i) prestação dos serviços da plataforma;
              (ii) comunicações operacionais; (iii) cumprimento de obrigações legais.
            </p>
            <p className="mt-2">
              Dados de localização (latitude/longitude) são utilizados exclusivamente para fins operacionais de
              agendamento e roteamento, e nunca serão compartilhados com terceiros para fins comerciais.
            </p>
          </Section>

          <Section title="9. Limitação de Responsabilidade">
            <p>
              A Painel Clean atua como intermediadora e não é parte nos contratos de prestação de serviço
              entre Clientes e Técnicos. A plataforma não se responsabiliza por danos causados por atos
              dolosos ou culposos dos Técnicos, nem por eventuais danos às instalações durante a prestação
              dos serviços.
            </p>
          </Section>

          <Section title="10. Alterações e Vigência">
            <p>
              Estes Termos podem ser atualizados a qualquer momento. Alterações substanciais serão comunicadas
              com antecedência mínima de 15 dias via e-mail cadastrado. O uso continuado da plataforma após a
              vigência das alterações implica aceitação dos novos termos.
            </p>
          </Section>

          <Section title="11. Foro e Legislação Aplicável">
            <p>
              Fica eleito o foro da comarca de <strong>Jaraguá do Sul, Santa Catarina</strong>, para dirimir
              quaisquer controvérsias oriundas destes Termos, com renúncia expressa a qualquer outro, por
              mais privilegiado que seja. Aplica-se a legislação brasileira.
            </p>
          </Section>

          <div className="bg-brand-light rounded-xl px-5 py-4 text-xs text-brand-muted border border-brand-border">
            <p className="font-semibold text-brand-dark mb-1">⚠️ Aviso legal</p>
            <p>
              Este documento é um rascunho provisório elaborado para fins de desenvolvimento do MVP da plataforma.
              Deve ser revisado e aprovado por assessoria jurídica especializada antes de entrar em vigor para
              usuários reais. Nenhuma responsabilidade legal é assumida com base neste texto.
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading font-bold text-brand-dark text-lg border-b border-brand-border pb-2">
        {title}
      </h2>
      <div className="text-sm text-brand-muted leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-brand-dark">
        {children}
      </div>
    </section>
  );
}
