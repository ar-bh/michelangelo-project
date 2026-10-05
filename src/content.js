import pietaModel from "./models/pieta.glb?url";
import mosesModel from "./models/moses.glb?url";
import sashImage from "./images/sash.png?url";
import anatomyBodyImage from "./images/anatomy-body.png?url";
import anatomyVeinsImage from "./images/anatomy-veins.png?url";
import maryFaceImage from "./images/mary-face.png?url";
import maryHandImage from "./images/mary-hand.png?url";
import pietaFullImage from "./images/pieta-full.png?url";

const anatomy = {
  images: [anatomyBodyImage, anatomyVeinsImage],
  headline: "Detail in Human Anatomy",
  details:
    "Michelangelo spent tons of time actually dissecting human corpses so he could understand how things like blood, bones, and muscles work. This is shown by the detail he puts, like in Jesus's right arm where you can clearly see the detailed veins. You can also see the depression in his stomach because of his hanging knees and the limpness in his muscles in his neck.",
};

/**
 * Hotspot positions live in normalized model space:
 * the mesh is centered at the origin and its longest side is 2 units.
 * Open the page with ?place=1 and click the marble to read a point
 * when adding Moses hotspots or moving these.
 *
 * theta / phi place the camera around that point
 * (phi 0 is above, phi 1.57 is level).
 * zoom is the camera distance as a multiple of the model's bounding radius.
 */
export const works = [
  {
    id: "moses",
    tab: "Moses",
    title: "Moses",
    years: "1513–1515",
    model: mosesModel,
    rotation: [0, 0, 0],
    home: { theta: 0.35, phi: 1.18 },
    hotspots: [],
  },
  {
    id: "pieta",
    tab: "Pietà",
    title: "Pietà",
    years: "1498–1499",
    model: pietaModel,
    // The exported scan lies on its side. This stands it up and turns the front toward the camera.
    rotation: [Math.PI / 2, 0, 0],
    home: { theta: 0.28, phi: 1.18 },
    hotspots: [
      {
        id: "sash",
        number: 1,
        image: sashImage,
        headline: "Michelangelo's Signature",
        details: [
          {
            text: "When Michelangelo finally finished Pietà, he heard visitors thinking that one of Michelangelo's rivals sculpted the statue and not him. This made him so angry that he snuck into the chapel where Pietà was being held in the night with a chisel and carved his name onto the sash across Mary's chest. ",
          },
          { text: "\"MICHEL.AELUS.BONAROTUS.FLORENT.FACIEBAT\"", bold: true },
          {
            text: " (Michelangelo Buonarroti, Florentine, was making this). This is the only artwork that Michelangelo ever signed in his life.",
          },
        ],
        position: [0.24, 0.4, 0.04],
        theta: 0.22,
        phi: 1.18,
        zoom: 0.72,
      },
      {
        id: "arm",
        number: 2,
        ...anatomy,
        position: [-0.5, -0.12, 0.35],
        lookAt: [-0.28, 0.06, 0.22],
        theta: -0.75,
        phi: 1.32,
        zoom: 1.05,
      },
      {
        id: "stomach",
        number: 2,
        ...anatomy,
        position: [0.02, 0.05, 0.38],
        theta: 0.08,
        phi: 1.22,
        zoom: 0.62,
      },
      {
        id: "mary",
        number: 3,
        image: maryFaceImage,
        headline: "Mary's Face",
        details:
          "Instead of having Mary look directly into her dead son's face, Michelangelo sculpted her face tilted slightly downward to the side. This is to display sorrow and acceptance of her son's sacrifice instead of grief and violence. Michelangelo directs the viewer's focus down towards Jesus's lifeless body using Mary's subtle gestures.",
        position: [0.08, 0.78, 0.16],
        theta: 0.15,
        phi: 1.15,
        zoom: 0.55,
      },
      {
        id: "hand",
        number: 4,
        image: maryHandImage,
        headline: "Mary's Hands",
        details:
          "Instead of having both hands clinging to Jesus, Mary has her left hand open with her palm facing the viewer and above. This gesture represents her transforming her grief into offering. Historians say its like she's presenting her son's sacrifice to the world instead of holding onto him.",
        position: [0.58, 0.38, 0.22],
        theta: 0.35,
        phi: 1.2,
        zoom: 0.5,
      },
      {
        id: "controversy",
        number: 5,
        images: [pietaFullImage, maryFaceImage],
        headline: "Controversy in Pietà",
        details:
          "Michelangelo sculptured Mary to make her much larger than Jesus. If she stood up, she would be over seven feet tall, but this decision was made so she would be able to support her adult son on her lap without the artwork looking strange. He also carved her face to look like a young teenager instead of a mother of a 33-year-old (she would have been around 45 years old, scholars estimate). These decisions were made to bring larger significance and bring sense to the idea of a mother holding her dead son and to reflect her divine purity as Virgin Mary.",
        position: [0.08, -0.48, 0.58],
        lookAt: [0.1, 0.1, 0.1],
        theta: 0.3,
        phi: 1.22,
        zoom: 1.25,
      },
    ],
  },
];
