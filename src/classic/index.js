import Event from './core/Event'
// import Draw from './base/Draw'
// import LayerList from './widget/LayerList'
import Identify from './widget/Identify'
import Label from './widget/Label'
import Measure from './widget/Measure'
import ToolBar from './widget/ToolBar'
import Bookmarks from './widget/Bookmarks'
import InfoStatistic from './widget/InfoStatistic'
import Screen from './widget/Screen'
import Slider from './widget/Slider'
import Faquery from './widget/QuickLook'
import CustomQuery from './widget/CustomQuery'
import AuxiliaryLocation from './widget/AuxiliaryLocation'
import MajorProjectQuery from './widget/MajorProjectQuery'
import InfoQuery from './widget/InfoQuery'
import ConstructionProjectStatistic from './widget/ConstructionProjectStatistic'
import LandUseStatistic from './widget/LandUseStatistic'
import UrbanRuralStatistic from './widget/UrbanRuralStatistic'
import ComplianceReview from './widget/ComplianceReview'
import CoordinateExport from './widget/CoordinateExport'
import ConflictDetection from './widget/ConflictDetection'
import ControlLineDetection from './widget/ControlLineDetection'
import Highlight from './common/Highlight'
import Sketch from './common/Sketch'
import Draw from './common/Draw'
import Calculate from "./common/calculate";
import BaseTools from './common/BaseTools';


let SgMap = {
  version: '1.0.0',
  Event,
  Draw,
  // LayerList,
  Identify,
  Label,
  Measure,
  ToolBar,
  Bookmarks,
  InfoStatistic,
  Screen,
  Slider,
  Faquery,
  MajorProjectQuery,
  CustomQuery,
  AuxiliaryLocation,
  InfoQuery,
  LandUseStatistic,
  ConstructionProjectStatistic,
  UrbanRuralStatistic,
  Coordinate: CoordinateExport,
  ComplianceReview,
  ConflictDetection,
  ControlLineDetection,
  Highlight,
  Sketch,
  Calculate,
  BaseTools


}
//@ts-ignore
window.SgMap = SgMap
export default SgMap

