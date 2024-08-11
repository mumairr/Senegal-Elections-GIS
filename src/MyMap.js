import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import $ from "jquery";
import SelectDD from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactiveButton from 'reactive-button';
import colormap from 'colormap';
import APRLogo from './logos_elections_2019/APR.png';
import PASTEFLogo from './logos_elections_2019/PASTEF.png';
import PDSLogo from './logos_elections_2019/PDS.png';
import PURLogo from './logos_elections_2019/PUR.png';
import REWMILogo from './logos_elections_2019/REWMI.jpg';

/* Stylesheets */
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css'
import "./styles/ol.css";
import "./styles/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';

/* Openlayers */
import * as ol_color from 'ol/color';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM, XYZ, Vector as VectorSource } from 'ol/source';
import { defaults as defaultControls, } from 'ol/control';
import LayerGroup from 'ol/layer/Group';
import Vector from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults, MouseWheelZoom, Select } from 'ol/interaction';

/* Ol-ext */

import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import { pointerMove, singleClick } from 'ol/events/condition';
import Overlay from 'ol-ext/control/Overlay';
import Toggle from "ol-ext/control/Toggle";

let layers = [];
let basemaps, administrativeLyrs;
let initialMap;
let zoom = 7;
let center = [-1959935.30, 1554676.04];
let rotation = 0;

let admin0, admin1, admin2, admin3, admin4;
let locales_department, presidentielles_department, resultatslocales_department, resultatspresid_department, sociodemdata_regions, sociodemdata_department;
let adminLayers = [admin4, admin3, admin2, admin1, admin0]
let dataLayers = [locales_department, presidentielles_department, resultatslocales_department, resultatspresid_department, sociodemdata_regions, sociodemdata_department]
let socioLayersStyle = [];

const ramp = colormap({
    colormap: 'portland',
    nshades: 7,
});

let dataVectors = [
    { title: "Deparmental-Locales", column: "adm2_fr", color: "#6c7948", id: "0", a: "CONVERGENCE DÉMOCRATIQUE BOKK GIS GIS (OPPOSITION)", b: "GRANDE COALITION WALLU SENEGAL (OPPOSITION)", c: "BENNO BOKK YAAKAAR (MOUVANCE)", d: "SÉNÉGAL 2035 (MOUVANCE)", e: "UNION CITOYENNE BUNT BI (MOUVANCE)", f: "YEWWI ASKAN WI (OPPOSITION)", g: "JAMMI SÉNÉGAL", h: "REPUBLIQUE DES VALEURS (OPPOSITION)", i: "GUEUM SA BOPP (OPPOSITION)", j: "DEFAR SA GOKH (MOUVANCE)", k: "3EME VOIE", l: "COALITION DEFAR SA GOX (SOCIETE CIVILE)", m: "COALITION AND NAWLE/AND LIGUEEY	", n: "ANDU NAWLE SUXALI SUNU GOX (OPPOSITION)", o: "CPJE/ NAY LEER (OPPOSITION)", p: "COALITION DIISOO CI XAARNU BI (OPPOSITION)", q: "COALITION ANDU NAWLE SUXALI SUNU GOX (OPPOSITION)", r: "PARTI SOCIALISTE (MOUVANCE)", s: "NOUVELLE ALLIANCE DES FORCES RÉPUBLICAINES « NAFORE » (MOUVANCE)", t: "PARTI DES LIBERAUX ET DEMOCRATES/AND SUQALI (PLD/AS) (MOUVANCE)", u: "CONVERGENCE PATRIOTIQUE POUR LA JUSTICE ET L’EQUITE (CPJE/NAY LEER) (MOUVANCE)", v: "LE PARTI DE L’ESPOIR ET DU PROGRES (PEP) (MOUVANCE)", w: "CONVERGENCE PATRIOTIQUE POUR LA JUSTICE ET L'EQUITE (NAY LEER) (MOUVANCE)", x: "PARTI LOU JOT YOMBE (OPPOSITION)", y: "UNION CENTRISTE DU SÉNÉGAL (UCS) (INDEPENDANT)", z: "COALITION JAMMI GOX (OPPOSITION)" },
    { title: "Departmental-Presidentielles", column: "adm2_fr", color: "#486c79", id: "1", a: "Voters", b: "Votes", c: "Benno Bokk Yakaar", d: "Gagnante Wattu Senegal", e: "Manko Taxawou Sénégal", f: "P.U.R.", g: "Autres listes" },
    { title: "Department-Resultats Locales", column: "adm2_fr", color: "#795548", id: "2", a: "Benno Bokk Yaakaar", b: "Yewwi Askan Wi", c: "Wallu Senegal", d: "Union Citoyenne Bunt Bi", e: "Bokk Gis Gis", f: " N.A.FO.RE", g: "Guem Sa Bopp" },
    { title: "Department-Resultats Presidential", column: "adm2_fr", color: "#4caf50", id: "3", a: "Voters", b: "Votes", c: "Nulls", d: "Valid", e: "MACKY SALL", f: "IDRISSA SECK", g: "OUSMANE SONKO", h: "MADICKE NIANG", i: "EL HADJI SALL" },
    { title: "Regions-Socio Demographic Data", column: "adm1_fr", color: "#e91e63", id: "4", a: "Population", b: "Taux Brut de Scolarisation au Secondaire", c: "Taux Brut de Scolarisation à l'Elémentaire", d: "Taux Brut de Scolarisation au Moyen", e: "Taux Population Active", f: "Taux de Chomage", g: "Incidence pauvreté", h: "Nombre de Projets du Gouv.", i: "Montants en Milliards F CFA", j: "Coût Moyen en Milliards F CFA", k: "Espérance de Vie", l: "Mortal. Infantile / 1 000 (0-1 an)", m: "Mortal. Juvénile / 1 000 (1-5 ans)", n: "Ratio Mortal. Matern. / 100 000 nais.", o: "Taux Alphabétisation", p: "Taux Electrification", q: "Chasse raccordée à l’égout ou avec fosse", r: "Robinet dans logement", s: "Nombre de Structures FPT", t: "Utilisation Internet", u: "Taille de ménage", v: "Taux Dépôt Sauvage" },
    { title: "Department-Socio Demographic Data", column: "adm2_fr", color: "#f44336", id: "5", a: "Population", b: "Incidence Pauvreté", c: "Taux Electrification", d: "Taux Accès Eau Potable", e: "Taux Accès Toilettes Améliorées", f: "Nombre de Centre de Santé", g: "Nombre de Poste de Santé", h: "Nombre d'Hôpitaux", i: "Incidence Diarrhée", j: "Nombre d'Ecoles Maternelles", k: "Taux Brut de Scolarisation Primaire" }
];

let adminVectors = [
    { id: 4, title: "Communes", column: "adm4_fr", color: "yellow", layer: admin4 },
    { id: 3, title: "Arrondissements", column: "adm3_fr", color: "red", layer: admin3 },
    { id: 2, title: "Départements", column: "adm2_fr", color: "green", layer: admin2 },
    { id: 1, title: "Régions", column: "adm1_fr", color: "blue", layer: admin1 },
    { id: 0, title: "National", column: "adm0_fr", color: "purple", layer: admin0 }
];

let osm = new TileLayer({
    baseLayer: true,
    title: "OpenStreetMap",
    visible: false,
    source: new OSM()
});

let googleMaps = new TileLayer({
    baseLayer: true,
    title: "Google Maps",
    visible: true,
    source: new XYZ({
        url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'
    })
})

const selected = new Style({
    fill: new Fill({
        color: '#eeeeee',
    }),
    stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
    }),
});

function hoverStyle(feature) {
    var divideName = feature.get('id').split("-");
    const color = (divideName[0] === "bound") ? adminVectors[divideName[1]].color : dataVectors[divideName[1]].color;
    const [r, g, b] = Array.from(ol_color.asArray(color));
    selected.getFill().setColor(ol_color.asString([r, g, b, 0.5]))
    selected.getStroke().setColor("#fff")
    return selected;
}

function selectStyle(feature) {
    var divideName = feature.get('id').split("-");
    const color = (divideName[0] === "bound") ? adminVectors[divideName[1]].color : dataVectors[divideName[1]].color;
    const [r, g, b] = Array.from(ol_color.asArray(color));
    selected.getFill().setColor("#fff")
    selected.getStroke().setColor(ol_color.asString([r, g, b, 0.5]))
    return selected;
}

const selectHover = new Select({
    condition: pointerMove,
    style: hoverStyle
});

const selectClick = new Select({
    layers: dataLayers,
    condition: singleClick,
    style: selectStyle
});

function MapWrapper() {
    const [showLegend, setshowLegend] = useState(false);
    const [fvalue, setfValue] = useState(null);
    const [flabel, setflabel] = useState(null);
    const [sDDValue, setsDDValue] = useState(null);
    const [tDDValue, settDDValue] = useState(null);
    const [isOpen, setisOpen] = useState(true);
    const [titleShow, settitleShow] = useState(false);
    const [titleToShow, settitleToShow] = useState(false);
    const [map, setMap] = useState()
    let [hoveredFeature, sethoveredFeature] = useState()
    let [showThirdDD, setShowThirdDD] = useState(false);
    let [showSecDD, setShowSecDD] = useState(false);
    let [secDDOpts, setSecDDOpts] = useState([]);
    let [thirdDDOpts, setThirdDDOpts] = useState([]);

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    const resetMap = () => {
        clearValue();
        const view = initialMap.getView();
        view.animate({
            center: center,
            duration: 2000,
            zoom: zoom
        });
        setisOpen(true);
    }

    const clearValue = (event) => {
        setshowLegend(false);
        setfValue(null);
        setShowThirdDD(false);
        setShowSecDD(false);
        settitleShow(false);
        settitleToShow(false);
        setSecDDOpts([]);
        setThirdDDOpts([]);
        dataLayers.map((e) => {
            e.setVisible(false);
        })
        const body = document.getElementById('attributes');
        body.innerHTML = "";
    }

    const topChange = (event) => {
        dataLayers.map((e) => {
            try { e.setVisible(false); } catch (e) { }
        })
        setflabel(event.label);
        setfValue(event.value);
        setShowSecDD(true);
        if (event.value === "national" || event.value === "communes" || event.value === "arrondissements") {
            toast.dismiss();
            toast.warn("No data exists");
            setSecDDOpts()
            setShowSecDD(false)
        }
        if (event.value === "regions")
            setSecDDOpts([
                { value: 'socio', label: 'Socio-Démographie' }
            ])
        if (event.value === "departments")
            setSecDDOpts([
                { value: 'locales', label: 'Locales – 23 janv. 2022' },
                { value: 'presidentielles', label: 'Présidentielles – 24 fév. 2019 ' },
                { value: 'legislatives', label: 'Législatives – 30 juil. 2027' },
                { value: 'socio', label: 'Socio-Démographie' }
            ])
    }
    const secDDChange = (event) => {
        dataLayers.map((e) => {
            e.setVisible(false);
        })
        setsDDValue(event.value);

        settitleToShow(event.label + " / " + flabel);
        settitleShow(true);
        if (event.value === "locales") {
            dataLayers[0].setVisible(true);
        }
        if (event.value === "presidentielles") {
            dataLayers[3].setVisible(true);
        }
        if (event.value === "legislatives") {
            dataLayers[1].setVisible(true);
        }
        if (event.value === "socio" && fvalue === "departments") {
            setshowLegend(true);
            addLegend(socioLayersStyle[22].min, socioLayersStyle[22].max, socioLayersStyle[22].interval);
            dataLayers[5].setVisible(true);
            setThirdDDOpts([
                { value: 'a', label: "Population" },
                { value: 'b', label: "Incidence Pauvreté" },
                { value: 'c', label: "Taux Electrification" },
                { value: 'd', label: 'Taux Accès Eau Potable' },
                { value: 'e', label: "Taux Accès Toilettes Améliorées" },
                { value: 'f', label: "Nombre de Centre de Santé" },
                { value: 'g', label: "Nombre de Poste de Santé" },
                { value: 'h', label: "Nombre d'Hôpitaux" },
                { value: 'i', label: "Incidence Diarrhée" },
                { value: 'j', label: "Nombre d'Ecoles Maternelles" },
                { value: 'k', label: "Taux Brut de Scolarisation Primaire" }
            ])
            setShowThirdDD(true)
        }
        if (event.value === "socio" && fvalue === "regions") {
            setshowLegend(true);
            addLegend(socioLayersStyle[0].min, socioLayersStyle[0].max, socioLayersStyle[0].interval);
            dataLayers[4].setVisible(true);
            setThirdDDOpts([
                { value: 'a', label: "Population" },
                { value: 'b', label: "Taux Brut de Scolarisation au Secondaire" },
                { value: 'c', label: "Taux Brut de Scolarisation à l'Elémentaire" },
                { value: 'd', label: 'Taux Brut de Scolarisation au Moyen' },
                { value: 'e', label: "Taux Population Active" },
                { value: 'f', label: "Taux de Chomage" },
                { value: 'g', label: "Incidence pauvreté" },
                { value: 'h', label: "Nombre de Projets du Gouv." },
                { value: 'i', label: "Montants en Milliards F CFA" },
                { value: 'j', label: "Coût Moyen en Milliards F CFA" },
                { value: 'k', label: "Espérance de Vie" },
                { value: 'l', label: "Mortal. Infantile / 1 000 (0-1 an)" },
                { value: 'm', label: "Mortal. Juvénile / 1 000 (1-5 ans)" },
                { value: 'n', label: "Ratio Mortal. Matern. / 100 000 nais." },
                { value: 'o', label: "Taux Alphabétisation" },
                { value: 'p', label: "Taux Electrification" },
                { value: 'q', label: "Chasse raccordée à l’égout ou avec fosse" },
                { value: 'r', label: "Robinet dans logement" },
                { value: 's', label: "Nombre de Structures FPT" },
                { value: 't', label: "Utilisation Internet" },
                { value: 'u', label: "PopulatiTaille de ménageon" },
                { value: 'v', label: "Taux Dépôt Sauvage" }
            ])
            setShowThirdDD(true)
        }
    }
    const thirdDDChange = (event) => {
        if (fvalue == "regions") {
            let features = dataLayers[4].getSource().getFeatures();
            let color = "";
            if (event.value === "a") {
                let defaultstyle = socioLayersStyle[0];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('a') > b.get('a')) ? 1 : -1)
                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('a') >= defaultstyle.min && features[i].get('a') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "b") {
                let defaultstyle = socioLayersStyle[1];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('b') > b.get('b')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('b') >= defaultstyle.min && features[i].get('b') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "c") {
                let defaultstyle = socioLayersStyle[2];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('c') > b.get('c')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('c') >= defaultstyle.min && features[i].get('c') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "d") {
                let defaultstyle = socioLayersStyle[3];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('d') > b.get('d')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('d') >= defaultstyle.min && features[i].get('d') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "e") {
                let defaultstyle = socioLayersStyle[4];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('e') > b.get('e')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('e') >= defaultstyle.min && features[i].get('e') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "f") {
                let defaultstyle = socioLayersStyle[5];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('f') > b.get('f')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('f') >= defaultstyle.min && features[i].get('f') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "g") {
                let defaultstyle = socioLayersStyle[6];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('g') > b.get('g')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('g') >= defaultstyle.min && features[i].get('g') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "h") {
                let defaultstyle = socioLayersStyle[7];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('h') > b.get('h')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('h') >= defaultstyle.min && features[i].get('h') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "i") {
                let defaultstyle = socioLayersStyle[8];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('i') > b.get('i')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('i') >= defaultstyle.min && features[i].get('i') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "j") {
                let defaultstyle = socioLayersStyle[9];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('j') > b.get('j')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('j') >= defaultstyle.min && features[i].get('j') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "k") {
                let defaultstyle = socioLayersStyle[10];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('k') > b.get('k')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('k') >= defaultstyle.min && features[i].get('k') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "l") {
                let defaultstyle = socioLayersStyle[11];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('l') > b.get('l')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('l') >= defaultstyle.min && features[i].get('l') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('l') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "m") {
                let defaultstyle = socioLayersStyle[12];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('m') > b.get('m')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('m') >= defaultstyle.min && features[i].get('m') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('m') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "n") {
                let defaultstyle = socioLayersStyle[13];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('n') > b.get('n')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('n') >= defaultstyle.min && features[i].get('n') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('n') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "o") {
                let defaultstyle = socioLayersStyle[14];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('o') > b.get('o')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('o') >= defaultstyle.min && features[i].get('o') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('o') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "p") {
                let defaultstyle = socioLayersStyle[15];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('p') > b.get('p')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('p') >= defaultstyle.min && features[i].get('p') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('p') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "q") {
                let defaultstyle = socioLayersStyle[16];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('q') > b.get('q')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('q') >= defaultstyle.min && features[i].get('q') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('q') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "r") {
                let defaultstyle = socioLayersStyle[17];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('r') > b.get('r')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('r') >= defaultstyle.min && features[i].get('r') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('r') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "s") {
                let defaultstyle = socioLayersStyle[18];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('s') > b.get('s')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('s') >= defaultstyle.min && features[i].get('s') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('s') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "t") {
                let defaultstyle = socioLayersStyle[19];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('t') > b.get('t')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('t') >= defaultstyle.min && features[i].get('t') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('t') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "u") {
                let defaultstyle = socioLayersStyle[20];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('u') > b.get('u')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('u') >= defaultstyle.min && features[i].get('u') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('u') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "v") {
                let defaultstyle = socioLayersStyle[21];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('v') > b.get('v')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('v') >= defaultstyle.min && features[i].get('v') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('v') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
        }
        if (fvalue == "departments") {
            let features = dataLayers[5].getSource().getFeatures();
            let color = "";
            if (event.value === "a") {
                let defaultstyle = socioLayersStyle[22];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('a') > b.get('a')) ? 1 : -1)
                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('a') >= defaultstyle.min && features[i].get('a') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "b") {
                let defaultstyle = socioLayersStyle[23];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('b') > b.get('b')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('b') >= defaultstyle.min && features[i].get('b') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('b') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "c") {
                let defaultstyle = socioLayersStyle[24];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('c') > b.get('c')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('c') >= defaultstyle.min && features[i].get('c') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('c') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "d") {
                let defaultstyle = socioLayersStyle[25];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('d') > b.get('d')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('d') >= defaultstyle.min && features[i].get('d') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('d') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "e") {
                let defaultstyle = socioLayersStyle[26];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('e') > b.get('e')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('e') >= defaultstyle.min && features[i].get('e') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('e') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "f") {
                let defaultstyle = socioLayersStyle[27];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('f') > b.get('f')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('f') >= defaultstyle.min && features[i].get('f') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('f') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "g") {
                let defaultstyle = socioLayersStyle[28];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('g') > b.get('g')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('g') >= defaultstyle.min && features[i].get('g') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('g') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "h") {
                let defaultstyle = socioLayersStyle[29];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('h') > b.get('h')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('h') >= defaultstyle.min && features[i].get('h') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('h') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "i") {
                let defaultstyle = socioLayersStyle[30];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('i') > b.get('i')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('i') >= defaultstyle.min && features[i].get('i') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('i') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "j") {
                let defaultstyle = socioLayersStyle[31];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('j') > b.get('j')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('j') >= defaultstyle.min && features[i].get('j') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('j') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
            if (event.value === "k") {
                let defaultstyle = socioLayersStyle[32];
                addLegend(defaultstyle.min, defaultstyle.max, defaultstyle.interval);
                features.sort((a, b) => (a.get('k') > b.get('k')) ? 1 : -1)

                for (var i = 0; i < features.length; i++) {
                    let currentVal = defaultstyle.min + defaultstyle.interval;
                    if (features[i].get('k') >= defaultstyle.min && features[i].get('k') <= currentVal) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[0])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[1])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[2])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[3])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[4])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[5])
                    }
                    if (features[i].get('k') >= currentVal && currentVal + defaultstyle.interval) {
                        currentVal += defaultstyle.interval;
                        color = hexToRgbA(ramp[6])
                    }
                    features[i].setStyle(
                        new Style({
                            fill: new Fill({
                                color: color,
                            }),
                            stroke: new Stroke({
                                color: "black",
                            })
                        })
                    );
                }
            }
        }

    }

    useEffect(() => {
        administrativeLyrs = new LayerGroup({
            title: 'Découpages Administratifs',
            visible: true,
            openInLayerSwitcher: false
        });
        basemaps = new LayerGroup({
            title: 'Cartographies',
            openInLayerSwitcher: false,
            layers: [
                osm,
                googleMaps]
        });
        layers = [
            basemaps,
            administrativeLyrs
        ];

        initialMap = new Map({
            interactions: defaults({ mouseWheelZoom: false }).extend([
                new MouseWheelZoom({
                    constrainResolution: true
                }),
                selectHover,
                selectClick
            ]),
            target: mapElement.current,
            layers: layers,
            view: new View({
                center: center,
                zoom: zoom,
                rotation: rotation
            }),
            controls: defaultControls().extend([]),
        })

        setMap(initialMap);

        initialMap.on("pointermove", function (evt) {
            var hit = this.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                return true;
            });
            if (hit) {
                this.getTargetElement().style.cursor = 'pointer';
            } else {
                this.getTargetElement().style.cursor = '';
            }
        });

        let switcher = new LayerSwitcher({
            show_progress: true,
            extent: true,
            trash: true,
        });

        initialMap.addControl(switcher);

        const img = new Image();
        const ctrlBt = switcher.element.querySelector('button');
        ctrlBt.appendChild(img);
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAAXNSR0IArs4c6QAAANtQTFRFAAAAVaqqgL+A/9VV/+pV8Y6O/+ZN84aGQqBfQqBmQJxjPp9gRJ9gPpphQp5hQZxf94R/9IF++IV+/+U//+k/9IOA/+Y+/+c6/+Q59YB59n57+X57/+Q1/+Q49n549Xx5+Hx5OZpaOJhY/+Y093p3/+Y093t29Xt29Xp2NZdWNJdXNZZWNJhXNJdW/+Ux9Xl19nl1/+Uw/+Yw9nl1MpZVMpZVMpZU/+Uv9nh093h093h0/+Uv/+Uw/+Yv9nh0MZVTMZZUMZVUMZZU/+Ut9ndz/+UtMJVT9ndz/+UtPLoJNAAAAEZ0Uk5TAAMEDAwSFBUjIyQtLTo6OzxFRUVFRkZLTE5TU1ZWV2dnb3yOlpiZmpuusLK5u8fNzc7Oz9/l5u3u8PHx8fHy+Pj6+v3+/owekXcAAAFHSURBVDjLlZPpVsIwEIUHhCIWUURlE5QWULaWspWyL6XN+z+RyaSF0u0c7q/M3OR+k3MSgDtVLMbaXytCVvVIW9AIShPC/faZODq3Q+z6hni08XOEMfFpLISnX+Xh3KYHORqJlMb8TxKjd7ajrEfZetkZQj6F2Sf5eouUEvSV1MXuH6QAh6ZLhz7aT3vLsmbPNxyanp/R9j5LN2R3FtMgceUoD4kBNnePmNHD4ihBCTl6CaQjtnruEOIU61ke5PVahpc5ltPcZcpXaHLOMAmQHPL0Jm1zVRb2JONwrDk/TdMzE3tRYf6HTWV2XA5PF6Fjsv4b26Gylb1suByW3lhiU+WMmoGVy8F0JqN2mbKFeeYv5LpdEf541fI+qfQIz2y/AX62uBylfa/S4TjypIOPE0z3cPh9bDUd+beqlGNUY39noXDvd/8HVAGJ9XvHRaQAAAAASUVORK5CYII=';

        // let endpoints = [
        //     '../node/boundary/4',
        //     '../node/boundary/3',
        //     '../node/boundary/2',
        //     '../node/boundary/1',
        //     '../node/boundary/0'
        // ];

        // let dataendpoints = [
        //     '../node/data/locales_department',
        //     '../node/data/presidentielles_department',
        //     '../node/data/resultatslocales_department',
        //     '../node/data/resultatspresid_department',
        //     '../node/data/sociodemdata_regions',
        //     '../node/data/sociodemdata_department'
        // ];


        let endpoints = [
            'http://localhost:3001/boundary/4',
            'http://localhost:3001/boundary/3',
            'http://localhost:3001/boundary/2',
            'http://localhost:3001/boundary/1',
            'http://localhost:3001/boundary/0'
        ];

        let dataendpoints = [
            'http://localhost:3001/data/locales_department',
            'http://localhost:3001/data/presidentielles_department',
            'http://localhost:3001/data/resultatslocales_department',
            'http://localhost:3001/data/resultatspresid_department',
            'http://localhost:3001/data/sociodemdata_regions',
            'http://localhost:3001/data/sociodemdata_department'
        ];

        axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
            (data) => {
                data.map((json, index) => {
                    addLayer(json, index)
                    return null
                })
                axios.all(dataendpoints.map((endpoint) => axios.get(endpoint))).then(
                    (dataTwo) => {
                        console.log(dataTwo);
                        dataTwo.map((json, index) => {
                            addLayerData(json, index)
                            return null
                        })
                    }
                );
            }
        );

        selectHover.on('select', function (e) {
            if (e.selected.length > 0) {
                const divideLyr = e.selected[0].get('id').split("-");
                if (divideLyr[0] === "bound")
                    sethoveredFeature(e.selected[0].get('val'))
                else {
                    (divideLyr[1] === "4") ? sethoveredFeature(e.selected[0].get('adm1_fr')) : sethoveredFeature(e.selected[0].get('adm2_fr'))
                }
            }
            else
                sethoveredFeature("");
        });

        selectClick.on('select', function (e) {
            const body = document.getElementById('attributes');
            body.innerHTML = "";
            if (e.selected.length > 0) {
                const name = e.selected[0].get('id').split("-");
                //umair change to 1 for right info but wrong columns, may be change layer?
                if (name[1] === "2") {
                    console.log('b');
                    $("#attributes").append('<div class="senelect-tooltip" style="visibility: visible; top: 118.075px; left: 418.8px;">');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="topRow">');
                    $("#topRow").append('<h4 id="tooltip-department">Dept.: ' + e.selected[0].get('adm2_fr') + '</h4>');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="secRow">');
                    $("#secRow").append('<h6 id="tooltip-region">Région: ' + e.selected[0].get('adm1_fr') + '</h6>');
                    $(".senelect-tooltip").append('<table id="tooltip-table">');
                    $("#tooltip-table").append('<thead><tr class="tooltip-table-header"><th class="left">Candidats</th><th class="right">Pct</th><th class="right"></th></tr></thead>');
                    $("#tooltip-table").append('<tbody id="tooltip-table-body">');
                    for (const [key, value] of Object.entries(dataVectors[name[1]])) {
                        if (key === "title" || key === "color" || key === "id" || key === "column")
                            continue;
                        else if (e.selected[0].get(key) == null)
                            continue;
                        else {
                            let color;
                            if (key === "a") {
                                color = "rgb(120, 63, 4)"
                            }
                            if (key === "b") {
                                color = "rgb(204, 0, 0)"
                            }
                            if (key === "c") {
                                color = "rgb(255, 217, 102)"
                            }
                            if (key === "d") {
                                color = "rgb(60, 120, 216)"
                            }
                            if (key === "e") {
                                color = "rgb(166, 77, 121)"
                            }
                            if (key === "f") {
                                color = "rgb(56, 118, 29)"
                            }
                            if (key === "g") {
                                color = "rgb(0, 0, 255)"
                            }
                            $("#tooltip-table tbody").append('<tr><td class="color-box"><span style="background-color: ' + color + ';"></span><span>' + `${value}` + '</span></td><td class="right">' + ((e.selected[0].get(key) === null) ? 0 : e.selected[0].get(key)) + ' %</td></tr>');
                        }
                    }
                }
                else if (name[1] === "3") {
                    console.log('b');
                    let sum = Number(e.selected[0].get('e')) + Number(e.selected[0].get('f')) + Number(e.selected[0].get('g')) + Number(e.selected[0].get('h')) + Number(e.selected[0].get('i'));

                    $("#attributes").append('<div class="senelect-tooltip" style="visibility: visible; top: 118.075px; left: 418.8px;">');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="topRow">');
                    $("#topRow").append('<h4 id="tooltip-department">Dept.: ' + e.selected[0].get('adm2_fr') + '</h4><span id="total-voters">Inscrits: ' + e.selected[0].get('a') + '</span>');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="secRow">');
                    $("#secRow").append('<h6 id="tooltip-region">Région: ' + e.selected[0].get('adm1_fr') + '</h6><span id="total-votes">Votes: ' + sum + ' (' + Math.ceil(sum / e.selected[0].get('a') * 100) + ' %)</span>');
                    $(".senelect-tooltip").append('<table id="tooltip-table">');
                    $("#tooltip-table").append('<thead><tr class="tooltip-table-header"><th class="left">Candidats</th><th class="right">Parti</th><th class="right">Total</th><th class="right">Pct</th></tr></thead>');
                    $("#tooltip-table").append('<tbody id="tooltip-table-body">');
                    for (const [key, value] of Object.entries(dataVectors[name[1]])) {
                        if (key === "title" || key === "color" || key === "column" || key === "id" || key === "a" || key === "b" || key === "c" || key === "d")
                            continue;
                        else if (e.selected[0].get(key) == null)
                            continue;
                        else {
                            let color, party, logo, h, w, style = null;
                            if (key === "e") { logo = APRLogo; color = "rgb(116, 88, 56)"; party = "APR"; h = "50"; w = "60"; }
                            if (key === "f") { style = 'style="margin-right:25px;"'; logo = REWMILogo; color = "rgb(218, 133, 77)"; party = "REWMI"; h = "40"; w = "40"; }
                            if (key === "g") { style = null; logo = PASTEFLogo; color = "rgb(161, 60, 63)"; party = "PASTEF"; h = "25"; w = "65"; }
                            if (key === "h") { style = 'style="margin-right:15px;"'; logo = PDSLogo; color = "rgb(38, 105, 162)"; party = "PDS"; h = "40"; w = "50"; }
                            if (key === "i") { style = 'style="margin-right:15px;"'; logo = PURLogo; color = "rgb(82, 169, 107)"; party = "PUR"; h = "40"; w = "50"; }
                            $("#tooltip-table tbody").append('<tr><td class="color-box"><span style="background-color: ' + color + ';"></span><img height=' + h + ' width=' + w + ' src=' + logo + ' alt="partyLogo" ' + style + '/><span>' + `${value}` + '</span></td><td class="right">' + party + '</td><td class="right">' + ((e.selected[0].get(key) === null) ? 0 : e.selected[0].get(key).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")) + '</td><td class="right">' + Math.ceil(e.selected[0].get(key) / sum * 100) + ' %</td></tr>');
                        }
                    }
                }
                else if (name[1] === "4") {
                    console.log('b');
                    $("#attributes").append('<div class="senelect-tooltip" style="visibility: visible; top: 118.075px; left: 418.8px;">');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="secRow">');
                    $("#secRow").append('<h4 id="tooltip-region">Région: ' + e.selected[0].get('adm1_fr') + '</h4>');
                    $(".senelect-tooltip").append('<div class="socio-datapoint">');
                    $(".socio-datapoint").append('<span class="datapoint-value">' + e.selected[0].get("a").toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '</span>');
                    $(".socio-datapoint").append('<span class="datapoint-label">Population</span>');
                    $(".socio-datapoint").append('<div class="other-values">');
                    $(".other-values").append('<ul id="other-values-list">');
                    for (const [key, value] of Object.entries(dataVectors[name[1]])) {
                        if (key === "title" || key === "color" || key === "id" || key === "column")
                            continue;
                        else if (e.selected[0].get(key) == null)
                            continue;
                        else {
                            let val = e.selected[0].get(key);
                            // if (val.indexOf(".") !== -1 && val.charAt(0) === '0') {
                            val = val;
                            // }
                            // else
                            //     val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

                            $("#other-values-list").append('<li>' + `${value}` + ' : ' + ((e.selected[0].get(key) === null) ? 0 : val) + '</li>');
                        }
                    }
                }
                else if (name[1] === "5") {
                    console.log('b');
                    $("#attributes").append('<div class="senelect-tooltip" style="visibility: visible; top: 118.075px; left: 418.8px;">');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="topRow">');
                    $("#topRow").append('<h4 id="tooltip-department">Dept.: ' + e.selected[0].get('adm2_fr') + '</h4>');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="secRow">');
                    $("#secRow").append('<h6 id="tooltip-region">Région: ' + e.selected[0].get('adm1_fr') + '</h6>');
                    $(".senelect-tooltip").append('<div class="socio-datapoint">');
                    $(".socio-datapoint").append('<span class="datapoint-value">' + e.selected[0].get("a").toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '</span>');
                    $(".socio-datapoint").append('<span class="datapoint-label">Population</span>');
                    $(".socio-datapoint").append('<div class="other-values">');
                    $(".other-values").append('<ul id="other-values-list">');
                    for (const [key, value] of Object.entries(dataVectors[name[1]])) {
                        if (key === "title" || key === "color" || key === "id" || key === "column")
                            continue;
                        else if (e.selected[0].get(key) == null)
                            continue;
                        else {
                            let val = e.selected[0].get(key);
                            // if (val.indexOf(".") !== -1 && val.charAt(0) === '0') {
                            // val = val;
                            // }
                            // else
                            //     val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

                            $("#other-values-list").append('<li>' + `${value}` + ' : ' + ((e.selected[0].get(key) === null) ? 0 : val) + '</li>');
                        }
                    }
                }
                else {
                    console.log('a');

                    $("#attributes").append('<div class="senelect-tooltip" style="visibility: visible; top: 118.075px; left: 418.8px;">');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="topRow">');
                    $("#topRow").append('<h4 id="tooltip-department">Dept.: ' + e.selected[0].get('adm2_fr') + '</h4>');
                    $(".senelect-tooltip").append('<div class="tooltip-title-row" id="secRow">');
                    $("#secRow").append('<h6 id="tooltip-region">Région: ' + e.selected[0].get('adm1_fr') + '</h6>');
                    $(".senelect-tooltip").append('<table id="tooltip-table">');
                    $("#tooltip-table").append('<tbody id="tooltip-table-body">');
                    for (const [key, value] of Object.entries(dataVectors[name[1]])) {
                        if (key === "title" || key === "color" || key === "id" || key === "column")
                            continue;
                        else if (e.selected[0].get(key) == null)
                            continue;
                        else {
                            $("#tooltip-table tbody").append('<tr><td class="color-box"><span>' + `${value}` + '</span></td><td class="right">' + e.selected[0].get(key).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '</td></tr>');
                        }
                    }
                }
            }
        });

        switcher.on('drawlist', (e) => {
            e.li.querySelector('label').addEventListener('click', () => {
                const body = document.getElementById('attributes');
                body.innerHTML = "";
            });
        });

        var menu = new Overlay({
            closeBox: true,
            className: "slide-left menu",
            content: $("#menu").get(0)
        });
        initialMap.addControl(menu);

        var t = new Toggle(
            {
                html: '<i class="fa fa-bars" ></i>',
                className: "menu",
                title: "Menu",
                onToggle: function () { menu.toggle(); }
            });
        initialMap.addControl(t);

        initialMap.on('click', function () {
            if (menu.getVisible())
                menu.toggle();
        });
    }, [])

    function addLayerData(json, dex) {
        var vectorSource = new VectorSource();
        json.data.map(fea =>
            vectorSource.addFeature(new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(fea.feature)[0])
        );
        dataLayers[dex] = new Vector({
            title: dataVectors[dex].title,
            visible: false,
            source: vectorSource,
            name: dex,
            declutter: true
            // style: function (feature, resolution) {
            //     return new Style({
            //         stroke: new Stroke({
            //             color: dataVectors[dex].color,
            //             width: 2
            //         }),
            //         fill: new Fill({
            //             color: 'rgba(255, 0, 0, 0)'
            //         })
            //     })
            // }
        });

        if (dex === 5) {
            let legendendpoints = [
                'http://localhost:3001/legend/sociodemdata_regions',
                'http://localhost:3001/legend/sociodemdata_department'
            ];
            axios.all(legendendpoints.map((endpoint) => axios.get(endpoint))).then(
                (dataTwo) => {
                    dataTwo.map((json, index) => {
                        var lookup = {};
                        var items = json.data;
                        var result = [];

                        for (var item, z = 0; item = items[z++];) {
                            var name = item.col;

                            if (!(name in lookup)) {
                                lookup[name] = 1;
                                result.push(index + "-" + name);
                            }
                        }
                        result.forEach(a => {
                            var filtered = json.data.filter((f) => (f['col'] === a.charAt(2)));
                            if (socioLayersStyle.some(e => e.col === a.charAt(2))) {
                            }
                            else {
                                var min = Math.min(...filtered.map(item => item.val));
                                var max = Math.max(...filtered.map(item => item.val));
                                let ab = [min, max];
                                const start = ab[0];
                                const end = ab[1];
                                const interval = (end - start) / 7;
                                socioLayersStyle.push({ 'col': a, 'min': min, 'max': max, 'interval': interval })
                            }
                        });
                    })

                    var defaultstyle = socioLayersStyle[0];
                    var features = dataLayers[4].getSource().getFeatures();
                    features.sort((a, b) => (a.get('a') > b.get('a')) ? 1 : -1)

                    for (var i = 0; i < features.length; i++) {
                        let color;
                        let currentVal = defaultstyle.min + defaultstyle.interval;
                        if (features[i].get('a') >= defaultstyle.min && features[i].get('a') <= currentVal) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[0])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[1])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[2])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[3])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[4])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[5])
                        }
                        if (features[i].get('a') >= currentVal && currentVal + defaultstyle.interval) {
                            currentVal += defaultstyle.interval;
                            color = hexToRgbA(ramp[6])
                        }
                        features[i].setStyle(
                            new Style({
                                fill: new Fill({
                                    color: color,
                                }),
                                stroke: new Stroke({
                                    color: "black",
                                })
                            })
                        );
                    }
                }
            );
        }

        for (var i = 0; i < dataLayers[dex].getSource().getFeatures().length; i++) {
            dataLayers[dex].getSource().getFeatures()[i].setStyle(
                new Style({
                    fill: new Fill({
                        color: (dataLayers[dex].getSource().getFeatures()[i].get('color')) ? dataLayers[dex].getSource().getFeatures()[i].get('color') : ramp[Math.floor(Math.random() * 10)],
                    }),
                    stroke: new Stroke({
                        color: (dataLayers[dex].getSource().getFeatures()[i].get('color')) ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,0.8)',
                    }),
                })
            );
        }
        initialMap.addLayer(dataLayers[dex])
    }

    function addLayer(json, dex) {
        var vectorSource = new VectorSource();
        json.data.map(fea =>
            vectorSource.addFeature(new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(fea.feature)[0])
        );
        adminLayers[dex] = new Vector({
            title: adminVectors[dex].title,
            visible: (dex === 4) ? true : false,
            source: vectorSource,
            name: dex,
            declutter: true,
            style: function (feature, resolution) {
                return new Style({
                    stroke: new Stroke({
                        color: adminVectors[dex].color,
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 0, 0, 0)'
                    }),
                    text: new Text({
                        text: feature.get('val'),
                        font: initialMap.getView().getZoom() > 14 ? '12px Calibri,sans-serif' : '20px Calibri,sans-serif',
                        overflow: true,
                        fill: new Fill({
                            color: "#000",
                        }),
                        stroke: new Stroke({
                            color: '#fff',
                            width: 3,
                        }),
                    })
                })
            }
        });
        administrativeLyrs.getLayers().array_.push(adminLayers[dex])
    }

    return (
        <>
            <div className="maincontainer">
                <nav className="navbar navbar-expand-sm navbar-dark navbar-custom py-0 px-0">
                    <div>
                        <img id="logo"
                            onClick={resetMap} src={process.env.PUBLIC_URL + '/assets/images/logo.png'} alt="LogoTitle"
                            style={{ cursor: "pointer" }} /> &nbsp;&nbsp;&nbsp;
                        <span className="logoTitle">SENELECT</span>
                    </div>
                </nav>
                <div className="container">
                    <div id="map" ref={mapElement} style={{ width: "100vw", height: "100vh", left: 0, position: 'fixed' }}>
                        <div id="legend" style={{ "visibility": (showLegend) ? "visible" : "hidden" }}>
                            <div id="legendGradient"></div>
                        </div>
                        <ToastContainer
                            position="bottom-center"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                        <div id="status">
                            {hoveredFeature}
                        </div>
                        <div id="attributes">
                            { }
                        </div>
                        <div style={{
                            position: "fixed", zIndex: 50, left: "35%", background: "#fff", padding: "5px", borderRadius: "5px",
                            opacity: !titleShow ? "0" : "1", transition: "all .2s", visibility: !titleShow ? "hidden" : "visible",
                            fontWeight: "bold"
                        }}>
                            {titleToShow}
                        </div>
                        <div id="welcomeNote" style={{
                            background: "#F9EED8",
                            color: "black",
                            border: "1px solid black",
                            position: "fixed",
                            left: "3em",
                            bottom: "3em",
                            zIndex: 10,
                            padding: "10px",
                            borderRadius: "15px",
                            width: "30em",
                            opacity: !isOpen ? "0" : "1",
                            transition: "all .2s",
                            visibility: !isOpen ? "hidden" : "visible"
                        }}>
                            <ReactiveButton style={{
                                width: '3em'
                            }} color="red" size="small" shadow
                                idleText={
                                    <span>
                                        X
                                    </span>
                                } onClick={(e) => setisOpen(!isOpen)} />
                            <h2 style={{
                                textAlign: "center", borderBottom: "3px solid #D6D4C0", fontStyle: "italic"
                            }}>Bienvenue sur SENELECT</h2>
                            <p style={{ fontSize: 'smaller', textAlign: "justify" }}>Please use the portal for socio-economic data debug.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ position: 'fixed', bottom: 0, width: "100vw", textAlign: 'center', background: "#6c757c", color: "white", fontSize: "0.6em" }}>
                © Onyx/techWorks 2022
            </div>
            <div id="menu">
                <h3>Vues</h3>
                <div id="data">
                    Découpage:
                    <SelectDD placeholder={<div>Choisir…</div>}
                        defaultValue={fvalue}
                        onChange={topChange} options={
                            [
                                { value: 'national', label: 'National', isDisabled: true },
                                { value: 'regions', label: 'Régions' },
                                { value: 'departments', label: 'Départements' },
                                { value: 'arrondissements', label: 'Arrondissements', isDisabled: true },
                                { value: 'communes', label: 'Communes', isDisabled: true }
                            ]} />
                    {(showSecDD) ? "Données" : ""}
                    {(showSecDD) ? <SelectDD display={showSecDD} placeholder={<div>Choisir…</div>} options={secDDOpts} onChange={secDDChange} /> : ""}
                    {(showThirdDD) ? "Données" : ""}
                    {(showThirdDD) ? <SelectDD display={showThirdDD} placeholder={<div>Choisir…</div>} defaultValue={thirdDDOpts[0]} options={thirdDDOpts} onChange={thirdDDChange} /> : ""}
                    <br />
                    <div className="btnsDiv">
                        <ReactiveButton onClick={clearValue} color="yellow" size="small" shadow
                            idleText={
                                <span>
                                    Réinitialiser
                                </span>
                            } />
                        {/* <ReactiveButton onClick={clearValue} color="dark" size="small" shadow
                            style={{ marginLeft: "20px", float: "right" }}
                            idleText={
                                <span>
                                    Submit
                                </span>
                            } /> */}
                    </div>
                </div>
            </div>
        </>
    )

    function hexToRgbA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ', 1)';
        }
        throw new Error('Bad Hex');
    }
}

function addLegend(min, max, interval) {
    $(".labels").remove();
    $(".lines").remove();
    // $("#legend").innerHTML = '<div id="legendGradient"></div>';
    var gradientCss = '(left';
    for (var z = 0; z < ramp.length; ++z) {
        gradientCss += ', ' + ramp[z];
    }
    gradientCss += ')';
    $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', 'linear-gradient' + gradientCss);

    var legendWidth = $('#legendGradient').outerWidth();
    let offsetCount = 0;
    for (var i = min; i <= max; i += interval) {
        var offset = offsetCount * legendWidth / 7;
        if (offsetCount > 0 && offsetCount < 7) {
            offset -= 0.5;
        } else if (offsetCount === 7) {
            offset -= 1;
        }
        $('#legend').append($('<div class="lines">').css({
            'position': 'absolute',
            'left': offset + 'px',
            'top': '15px',
            'width': '1px',
            'height': '3px',
            'background': 'black'
        }));
        if (offsetCount === 0) {
            $('#legend').append($('<div class="labels">').css({
                'position': 'absolute',
                'left': (offset - 5) + 'px',
                'top': '18px',
                'width': '10px',
                'text-align': 'center',
                'font-size': '0.8em',
            }).html(min));
        }
        if (offsetCount === 6) {
            $('#legend').append($('<div class="labels">').css({
                'position': 'absolute',
                'left': (offset - 5) + 'px',
                'top': '18px',
                'width': '10px',
                'text-align': 'center',
                'font-size': '0.8em',
            }).html(max));
        }
        offsetCount++;
    }
}

export default MapWrapper;