# Nayara Leal Arquitetura

Site de apresentação da arquiteta Nayara Leal. A página reúne os serviços de arquitetura, apresenta as etapas de desenvolvimento de um projeto e mostra uma prévia do portfólio. O contato para solicitar um orçamento é feito pelo Instagram [@arquitetanayaraleal](https://www.instagram.com/arquitetanayaraleal/).

## Como rodar localmente

Com Node.js e npm instalados, abra o PowerShell na raiz do repositório e execute os comandos abaixo.

```powershell
cd site
npm.cmd ci
npm.cmd run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do site

A aplicação fica em `site/` e usa Next.js, React, TypeScript e CSS.

- `site/app/page.tsx` contém as seções da página inicial.
- `site/app/globals.css` reúne os estilos do site.
- `site/app/projects.ts` define os projetos exibidos no portfólio.
- `site/public/images/` guarda as imagens usadas na página.

## Comandos do projeto

Execute os comandos abaixo a partir de `site/`.

| Comando | Função |
| --- | --- |
| `npm run lint` | Verifica o código com ESLint. |
| `npm run typecheck` | Verifica os tipos do TypeScript. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Inicia a versão de produção após o build. |

## Banco MySQL local

A home usa o acervo provisório de `site/app/projects.ts` e roda sem banco. A base de dados usa MySQL 8.0 e o driver `mysql2`, compatível com o runtime Node.js do Next.js 16.4.6 instalado no projeto. O driver oferece pool de conexões, API de Promises e tipos TypeScript. A migração inicial fica em SQL. [Documentação do mysql2](https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool)

A migração cria `projetos` e `imagens_do_projeto`. Cada projeto tem slug único, categoria, descrição, posição de exibição, datas e status inicial de rascunho. As imagens guardam caminho, texto alternativo, posição, datas e tipo. Cada projeto aceita até uma capa e várias imagens de galeria. A migração cria apenas o esquema, sem inserir registros.

### Instalar e criar o banco

Use o Node.js 24 e instale o MySQL Community Server 8.0 com o cliente de linha de comando. Com o servidor local em execução, rode a partir da raiz do repositório.

```powershell
cd site
npm.cmd ci
$mysqlClient = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'
& $mysqlClient --host=127.0.0.1 --port=3306 --user=root --password --execute="CREATE DATABASE IF NOT EXISTS nayara_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
```

Ajuste o caminho do executável e a porta se sua instalação usar outros valores. O cliente pede a senha no terminal. Para a migração inicial, use uma conta local que tenha permissão para conectar e criar tabelas e referências em `nayara_dev`.

### Configurar, testar e migrar

Ainda em `site/`, copie o exemplo e preencha `MYSQL_USER` e `MYSQL_PASSWORD` com as credenciais locais. O arquivo `.env.local` é ignorado pelo Git. Os scripts se conectam a `127.0.0.1`.

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
notepad .env.local
npm.cmd run db:check
npm.cmd run db:migrate
```

`db:check` exibe o nome do banco selecionado e a versão do servidor. `db:migrate` aplica os arquivos SQL em ordem. As migrações atuais criam somente tabelas ausentes e preservam os projetos existentes.

## Painel privado local

### Iniciar o MySQL e criar a conta

Se o instalador do MySQL registrou o serviço padrão no Windows, verifique o estado dele no PowerShell. Se estiver parado, execute `Start-Service MySQL80` em um PowerShell com privilégios de administrador. Use o nome da sua instalação se for diferente.

```powershell
Get-Service MySQL80
```

Crie o banco e configure `.env.local` conforme a seção anterior. Com o PowerShell em `site/`, gere o hash de uma senha de 14 a 128 caracteres. O terminal oculta a digitação. Copie apenas o hash exibido.

```powershell
$senhaPainel = Read-Host 'Senha do painel' -AsSecureString
$codificacaoAnterior = $OutputEncoding
try {
    $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    ([System.Net.NetworkCredential]::new('', $senhaPainel)).Password | node db/admin-hash.mjs
} finally {
    $OutputEncoding = $codificacaoAnterior
    $senhaPainel.Dispose()
}
```

Em `.env.local`, preencha `ADMIN_EMAIL` com o e-mail escolhido pela Nayara, `ADMIN_PASSWORD_HASH` com o hash gerado e mantenha `ADMIN_ORIGIN=http://localhost:3000` para a execução local padrão. O painel aceita uma conta definida por esse arquivo. Para trocar a senha, gere outro hash, substitua o valor e reinicie o servidor Next.js. A troca invalida as sessões anteriores.

```powershell
npm.cmd run db:check
npm.cmd run db:migrate
npm.cmd run dev -- --hostname localhost --port 3000
```

Abra [http://localhost:3000/admin](http://localhost:3000/admin) e entre com o e-mail e a senha escolhidos. Use o mesmo endereço de `ADMIN_ORIGIN`. As sessões duram até oito horas e são revogadas ao sair. O login limita as tentativas no banco em janelas de dez minutos.

### Cadastrar o primeiro projeto

1. Em **Novo projeto**, preencha título, slug, categoria, descrição e ordem. Clique em **Criar rascunho**.
2. Envie uma foto por vez e descreva a imagem no campo de texto alternativo. Cada projeto aceita até 20 imagens estáticas JPEG, PNG ou WebP, de até 5 MB e 24 megapixels cada.
3. Escolha uma **Capa**. Ajuste a ordem e os textos das demais fotos e clique em **Salvar projeto**.
4. Abra **Pré-visualizar** para conferir a versão privada. A prévia usa os dados salvos.
5. Após aprovar o conteúdo, escolha **Publicado** e salve. Confira a página em [http://localhost:3000/portfolio](http://localhost:3000/portfolio). Para retirar o projeto, selecione **Rascunho** e salve novamente.

A Nayara precisa revisar títulos, categorias, descrições, escolha de capa, textos alternativos e autorização de uso das fotos antes de publicar. A seção provisória da home permanece em revisão. As imagens dessa seção não foram importadas para o portfólio.

### Arquivos e testes

Os uploads locais são convertidos para WebP e guardados em `site/.private-uploads/`, fora de `public/`. O MySQL guarda apenas os metadados. O Git ignora `.env.local` e a pasta de uploads. As rotas de imagens conferem a sessão do painel ou o status publicado no banco a cada pedido.

`npm.cmd test` roda testes de validação sem banco. Para repetir o teste no navegador, use uma instância local com um banco descartável migrado e uma conta de teste configurada. O teste cria projetos temporários, publica, edita e retira da publicação. Configure `ADMIN_TEST_EMAIL` e `ADMIN_TEST_PASSWORD` no ambiente do terminal de testes e rode `npm.cmd run test:e2e` com o site em execução. O teste usa Microsoft Edge por padrão, com perfis desktop e Pixel 7 emulado. Defina `ADMIN_TEST_ORIGIN` se o servidor de teste rodar em outra porta.

### Acesso pela internet

O armazenamento de arquivos desta etapa serve para desenvolvimento local. Para a Nayara usar o painel de outro dispositivo pela internet, será necessário hospedar o Next.js e o MySQL com conexões protegidas, configurar o domínio HTTPS em `ADMIN_ORIGIN`, guardar os segredos no ambiente da hospedagem e aplicar as migrações com backup. A conexão atual com MySQL usa loopback e precisará ser adaptada caso o banco fique em outro servidor.

Para as fotos, use armazenamento de objetos privado e persistente com backup. Mantenha a entrega mediada pela aplicação para que retirar um projeto da publicação bloqueie também os pedidos das imagens. Antes de liberar o acesso, teste o fluxo em HTTPS, a restauração de banco e arquivos e a proteção das rotas administrativas no ambiente hospedado.
