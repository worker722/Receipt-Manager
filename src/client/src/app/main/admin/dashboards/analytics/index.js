import withReducer from 'app/store/withReducer';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from '@lodash';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import reducer from './store';
import { getWidgets, selectWidgets } from './store/widgetsSlice';
import Header from './header';
import VisitorsOverviewWidget from './widgets/VisitorsOverviewWidget';
import ConversionsWidget from './widgets/ConversionsWidget';
import ImpressionsWidget from './widgets/ImpressionsWidget';
import VisitsWidget from './widgets/VisitsWidget';
import VisitorsVsPageViewsWidget from './widgets/VisitorsVsPageViewsWidget';
import NewVsReturningWidget from './widgets/NewVsReturningWidget';
import AgeWidget from './widgets/AgeWidget';
import LanguageWidget from './widgets/LanguageWidget';
import GenderWidget from './widgets/GenderWidget';

function AnalyticsDashboardPage() {

  return (
    <FusePageSimple
      header={<Header />}
      content={
        <>
          
        </>
      }
    />
  );
}

export default withReducer('analyticsDashboardPage', reducer)(AnalyticsDashboardPage);
