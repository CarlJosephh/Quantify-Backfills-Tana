/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("projects/ee-cjoseph/assets/Backfill_Validation/BF2021"),
    B3 = /* color: #d63000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.42816683857016, -18.81381811509544]),
            {
              "id": 3,
              "backfill": "",
              "system:index": "0"
            })]),
    B2 = /* color: #9999ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.44049144604633, -18.83134831979583]),
            {
              "id": 2,
              "backfill": "",
              "system:index": "0"
            })]),
    B1 = 
    /* color: #99ff99 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.456885107545354, -18.830129769200255]),
            {
              "id": 1,
              "backfill": "",
              "system:index": "0"
            })]),
    B21 = 
    /* color: #bf04c2 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.46476297605105, -18.81113291615497]),
            {
              "id": 21,
              "backfill": "",
              "system:index": "0"
            })]),
    BF22 = 
    /* color: #ff0000 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.46601824987002, -18.812483628501266]),
            {
              "id": 22,
              "backfill": "",
              "system:index": "0"
            })]),
    B15 = 
    /* color: #ff00ff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.48102744235457, -18.81580098915283]),
            {
              "id": 15,
              "backfill": "",
              "system:index": "0"
            })]),
    B16 = 
    /* color: #ff9999 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.49512513293685, -18.811616874885612]),
            {
              "id": 16,
              "backfill": "",
              "system:index": "0"
            })]),
    B4 = 
    /* color: #99ffff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.46779936868542, -18.864730437838833]),
            {
              "id": 4,
              "backfill": "",
              "system:index": "0"
            })]),
    B10 = 
    /* color: #bf04c2 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.51099703489642, -18.867979401436454]),
            {
              "id": 10,
              "backfill": "",
              "system:index": "0"
            })]),
    B17 = 
    /* color: #99ff99 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.507349744999956, -18.871259303945]),
            {
              "id": 17,
              "backfill": "",
              "system:index": "0"
            })]),
    BF18 = 
    /* color: #9999ff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.51144816037471, -18.87197502805386]),
            {
              "id": 18,
              "backfill": "",
              "system:index": "0"
            })]),
    B11 = 
    /* color: #ff0000 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.50966665922503, -18.888932511625065]),
            {
              "id": 11,
              "backfill": "",
              "system:index": "0"
            })]),
    B12 = 
    /* color: #00ff00 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.52799826574995, -18.876244499200325]),
            {
              "id": 12,
              "backfill": "",
              "system:index": "0"
            })]),
    B14 = 
    /* color: #999900 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.51008328382737, -18.896889614742427]),
            {
              "id": 14,
              "backfill": "",
              "system:index": "0"
            })]),
    B13 = 
    /* color: #0000ff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.4897104372302, -18.91380539285938]),
            {
              "id": 13,
              "backfill": "",
              "system:index": "0"
            })]),
    BF20 = 
    /* color: #99ffff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.43437214041444, -18.938437466490168]),
            {
              "id": 20,
              "backfill": "",
              "system:index": "0"
            })]),
    B9 = 
    /* color: #00ffff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.51945135771136, -18.944388741702962]),
            {
              "id": 9,
              "backfill": "",
              "system:index": "0"
            })]),
    B7 = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.549062945235775, -18.953480832598757]),
            {
              "id": 7,
              "backfill": "",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54738924681048, -18.95035548222725]),
            {
              "id": 7,
              "backfill": "",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([47.55022165953021, -18.951613747208942]),
            {
              "id": 7,
              "backfill": "",
              "system:index": "2"
            })]),
    B6 = 
    /* color: #98ff00 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.54601893344842, -18.97013100908981]),
            {
              "id": 6,
              "backfill": "",
              "system:index": "0"
            })]),
    B8 = 
    /* color: #ffc82d */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.57841704069476, -18.929450660165884]),
            {
              "id": 8,
              "backfill": "",
              "system:index": "0"
            })]),
    BF19 = 
    /* color: #ffff99 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.59242557419072, -18.907677790690965]),
            {
              "id": 19,
              "backfill": "",
              "system:index": "0"
            })]),
    B5 = 
    /* color: #ff99ff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.60229722082021, -18.95211050251987]),
            {
              "id": 5,
              "backfill": "",
              "system:index": "0"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530')
Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530'), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LC8201', true)
Map.addLayer(image,{min:0, max:3, palette:['FF4C33']}, 'backfills', true);