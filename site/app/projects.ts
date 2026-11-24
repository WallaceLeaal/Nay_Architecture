type ProjectPreview = {
  slug: string;
  provisionalTitle: string;
  category: "Residencial" | "Comercial" | "Interiores";
  image: { src: string; alt: string; width: number; height: number };
};

// Seleção para aprovação visual. Confirmar título, autoria e autorização antes de publicar.
export const projectPreviews: ProjectPreview[] = [
  {
    slug: "casa-terrea",
    provisionalTitle: "Casa térrea entre árvores",
    category: "Residencial",
    image: {
      src: "/images/casa-terrea.jpg",
      alt: "Fachada térrea envidraçada vista da rua, entre árvores e palmeiras",
      width: 1150,
      height: 642,
    },
  },
  {
    slug: "sobrado",
    provisionalTitle: "Sobrado com jardim frontal",
    category: "Residencial",
    image: {
      src: "/images/sobrado.jpg",
      alt: "Sobrado com painéis de madeira no pavimento superior e jardim junto à entrada",
      width: 900,
      height: 503,
    },
  },
  {
    slug: "quarto",
    provisionalTitle: "Quarto em tons naturais",
    category: "Interiores",
    image: {
      src: "/images/quarto.jpg",
      alt: "Quarto com cabeceira de madeira, roupa de cama clara e iluminação indireta",
      width: 900,
      height: 506,
    },
  },
];