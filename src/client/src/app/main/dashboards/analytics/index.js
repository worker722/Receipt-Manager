import FusePageSimple from "@fuse/core/FusePageSimple";
import withReducer from "app/store/withReducer";
import Header from "./header";
import reducer from "./store";

function AnalyticsDashboardPage() {
  return <FusePageSimple header={<Header />} content={<></>} />;
}

export default withReducer(
  "analyticsDashboardPage",
  reducer
)(AnalyticsDashboardPage);
