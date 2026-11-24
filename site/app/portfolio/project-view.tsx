import Image from "next/image";
import type { Project, ProjectImage } from "../../lib/project-store";

export default function ProjectView({ project, images, privatePreview = false }: {
  project: Project;
  images: ProjectImage[];
  privatePreview?: boolean;
}) {
  const cover = images.find((image) => image.tipo === "capa");
  const gallery = images.filter((image) => image.tipo === "galeria");
  const photoRoot = privatePreview ? "/admin/foto" : "/projeto-foto";

  return (
    <article className="portfolio-detail">
      <header>
        <p className="label">{project.categoria}</p>
        <h1>{project.titulo}</h1>
      </header>
      {cover && <Image className="portfolio-cover" src={`${photoRoot}/${cover.id}`}
        alt={cover.texto_alternativo} width={1440} height={900} unoptimized />}
      <p className="portfolio-description">{project.descricao}</p>
      {gallery.length > 0 && <div className="portfolio-gallery" aria-label="Galeria">
        {gallery.map((image) => <Image key={image.id} src={`${photoRoot}/${image.id}`}
          alt={image.texto_alternativo} width={640} height={480} unoptimized />)}
      </div>}
    </article>
  );
}
