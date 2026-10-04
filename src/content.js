import pietaModel from "./models/pieta.glb?url";
import mosesModel from "./models/moses.glb?url";

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
    id: "pieta",
    tab: "Pietà",
    title: "Pietà",
    years: "1498–1499",
    model: pietaModel,
    // The exported scan lies on its side. This stands it up and turns the front toward the camera.
    rotation: [Math.PI / 2, 0, 0],
    home: { theta: 0.28, phi: 1.18 },
    kicker: "St. Peter's Basilica, Rome",
    heading: "Mary holds Jesus",
    bullets: [
      "Michelangelo carved this in marble in 1498–1499, when he was in his early twenties.",
      "Mary holds Jesus after his body was taken down from the cross.",
      "Click a gold number on the statue, or a button below, to look closer.",
    ],
    credit:
      "Scan of a plaster cast. SMK, Royal Cast Collection, Copenhagen. Public domain.",
    hotspots: [
      {
        id: "sash",
        label: "Signed sash",
        title: "The only signature",
        position: [0.24, 0.4, 0.04],
        theta: 0.22,
        phi: 1.18,
        zoom: 0.72,
        bullets: [
          "A band across Mary's chest is carved with Michelangelo's name.",
          "He added it after he heard visitors give the credit to another artist.",
          "He never signed another sculpture.",
        ],
      },
      {
        id: "arm",
        label: "Arm and neck",
        title: "A body with weight",
        position: [-0.5, -0.12, 0.35],
        lookAt: [-0.28, 0.06, 0.22],
        theta: -0.75,
        phi: 1.32,
        zoom: 1.05,
        bullets: [
          "Jesus's arm hangs down, and veins stand out in the marble.",
          "His head has fallen back. The neck is not holding it up.",
          "Michelangelo studied real bodies so the weight feels honest.",
        ],
      },
      {
        id: "stomach",
        label: "Across the lap",
        title: "Stretched over the knees",
        position: [0.02, 0.05, 0.38],
        theta: 0.08,
        phi: 1.22,
        zoom: 0.62,
        bullets: [
          "Where Jesus lies over Mary's knees, the body is made a little too long.",
          "From the front, the stretch is hard to notice.",
          "He changed the shape so the pose still reads clearly when you stand below the statue.",
        ],
      },
    ],
  },
  {
    id: "moses",
    tab: "Moses",
    title: "Moses",
    years: "1513–1515",
    model: mosesModel,
    rotation: [0, 0, 0],
    home: { theta: 0.35, phi: 1.18 },
    kicker: "San Pietro in Vincoli, Rome",
    heading: "Moses with the tablets",
    bullets: [
      "Michelangelo carved this around 1513–1515 for the tomb of Pope Julius II.",
      "Moses holds the tablets of the law. The horns come from an old Latin Bible that mistook “rays of light” for horns.",
      "The body looks tense, as if he is about to stand.",
    ],
    credit:
      "Scan of a plaster cast. SMK, Royal Cast Collection, Copenhagen. Public domain.",
    hotspots: [],
  },
];
