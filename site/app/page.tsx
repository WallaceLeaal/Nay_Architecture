import Image from "next/image";
import HeaderNavigation from "./header-navigation";
import { projectPreviews } from "./projects";

const instagram = "https://www.instagram.com/arquitetanayaraleal/";

const services = [
  ["Consultoria", "Orientação para entender o terreno, organizar as primeiras decisões e planejar o investimento."],
  ["Projeto", "Estudo dos espaços, da circulação e da rotina de quem vai usar cada ambiente."],
  ["Marcenaria", "Móveis pensados para o espaço disponível e para o uso no dia a dia."],
  ["Detalhamento", "Desenhos e informações para orientar a execução das escolhas do projeto."],
];

const steps = [
  ["Entender", "Escutar sua história, conhecer sua rotina e conversar sobre o que você precisa."],
  ["Estruturar", "Organizar os ambientes, as prioridades e o que o espaço permite."],
  ["Visualizar", "Apresentar a proposta para que você possa imaginar como vai viver ali."],
  ["Materializar", "Detalhar as escolhas para orientar a execução."],
];

export default function Home() {
  return (
    <>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="header" id="inicio">
        <a className="brand" href="#inicio">
          <span>Nayara Leal</span>
          <small>Arquitetura e Interiores</small>
        </a>
        <HeaderNavigation />
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <picture className="hero-image">
            <source media="(max-width: 640px)" srcSet="/images/fachada-mobile.jpg" />
            {/* A capa usa uma versão móvel e outra ampla já comprimidas. */}
            <img src="/images/fachada.jpg" width="1680" height="945" fetchPriority="high"
              alt="Fachada térrea com pedra, ripas de madeira e um caminho entre canteiros" />
          </picture>
          <div className="hero-content">
            <h1 id="hero-title">Do terreno nasce<br className="desktop-break" /> a possibilidade.</h1>
            <p>Do projeto nasce a construção. E de cada escolha nasce um lugar para chamar de seu.</p>
            <a className="button button-light" href={instagram}>Conversar pelo Instagram</a>
          </div>
        </section>

        <ul className="categories" aria-label="Categorias de atuação">
          <li>Residencial</li><li>Comercial</li><li>Interiores</li>
        </ul>

        <section className="about frame" id="sobre" tabIndex={-1} aria-labelledby="sobre-title">
          <figure className="portrait">
            <Image src="/images/nayara.jpg" width={650} height={1138} unoptimized
              alt="Nayara Leal sentada em um banco, em retrato em preto e branco" />
          </figure>
          <div className="about-copy">
            <p className="label">Sobre</p>
            <h2 id="sobre-title">Nayara Leal</h2>
            <p>Sou arquiteta e crio casas e ambientes com a identidade de quem vai viver neles. Meu trabalho parte da sua rotina, do espaço disponível e do que você quer construir.</p>
            <p>Se você está planejando a primeira casa, inclusive pelo Minha Casa, Minha Vida, podemos conversar sobre como aproveitar o terreno, distribuir os ambientes e organizar as decisões do projeto.</p>
            <blockquote>“Não importa o tamanho do terreno, mas o tamanho dos sonhos que cabem nele.”</blockquote>
          </div>
        </section>

        <section className="services" id="servicos" tabIndex={-1} aria-labelledby="servicos-title">
          <div className="frame">
            <h2 id="servicos-title">Como posso ajudar</h2>
            <dl className="service-list">
              {services.map(([name, detail]) => (
                <div key={name}><dt>{name}</dt><dd>{detail}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <section className="method frame" id="metodo" tabIndex={-1} aria-labelledby="metodo-title">
          <h2 id="metodo-title">Do primeiro encontro ao projeto</h2>
          <div className="method-diagram">
            <svg viewBox="0 0 1120 110" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M1 70 C75 108 129 109 174 56 C218 4 164 5 165 43 C167 92 231 93 287 71 C362 39 416 34 450 55 C492 83 463 112 440 89 C416 64 468 29 535 25 C607 21 632 58 702 68 C787 78 824 31 783 24 C745 17 754 75 817 87 C916 104 993 38 1119 55" />
            </svg>
            <ol className="steps">
              {steps.map(([name, detail]) => (
                <li key={name}><h3>{name}</h3><p>{detail}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="portfolio frame" id="projetos" tabIndex={-1} aria-labelledby="projetos-title">
          <div className="portfolio-heading">
            <h2 id="projetos-title">Prévia de projetos</h2>
            <p>Seleção do acervo com identificação em revisão.</p>
          </div>
          <div className="project-grid">
            {projectPreviews.map(({ slug, category, provisionalTitle, image }) => (
              <figure className="project" key={slug}>
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized />
                <figcaption><span>{category}</span>{provisionalTitle}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="contact" id="contato" tabIndex={-1} aria-labelledby="contato-title">
          <div className="frame contact-inner">
            <h2 id="contato-title">Faça seu <em>orçamento.</em></h2>
            <div>
              <p>Conte em que etapa você está e o que gostaria de construir ou transformar.</p>
              <a className="button button-light" href={instagram}>Conversar pelo Instagram</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="frame footer-inner">
          <a className="brand" href="#inicio"><span>Nayara Leal</span><small>Arquitetura e Interiores</small></a>
          <a href={instagram}>Instagram <span className="footer-handle">@arquitetanayaraleal</span></a>
        </div>
      </footer>
    </>
  );
}
