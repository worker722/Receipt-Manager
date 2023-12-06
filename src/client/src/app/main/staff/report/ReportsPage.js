import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import withRouter from "@fuse/core/withRouter";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { showMessage } from "app/store/fuse/messageSlice";
import withReducer from "app/store/withReducer";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import ReportStatus from "./ReportStatus";
import reducer from "./store";
import { getAllReports, selectReports } from "./store/reportsSlice";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

const ReportsPage = (props) => {
  const { t } = useTranslation("ReportsPage");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const dispatch = useDispatch();
  const { reports } = useSelector(selectReports);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllReports()).then((data) => {
      setLoading(false);
    });
  }, [dispatch]);

  useEffect(() => {
    setRows(reports);
  }, [reports]);

  const handleDoubleClick = (params) => {
    props.navigate(`/reports/${params.row.public_id}`);
  };

  const _showMessage = (message = "", variant = "info") => {
    dispatch(
      showMessage({
        message,
        variant,
      })
    );
  };

  const toLocalTime = (time, format = "YYYY-MM-DD") => {
    return moment.utc(time).local().format(format);
  };

  const columns = [
    {
      field: "public_id",
      headerName: "ID",
      width: 100,
    },
    {
      field: "expense_ids",
      headerName: "Expenses",
      width: 150,
      valueGetter: (params) => params.row.expense_ids.length,
    },
    {
      field: "receipt_ids",
      headerName: "Receipts",
      width: 150,
      valueGetter: (params) => params.row.receipt_ids.length,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        return <ReportStatus value={params.row.status} />;
      },
    },
    {
      field: "created_at",
      headerName: "Created at",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.created_at),
    },
    {
      field: "updated_at",
      headerName: "Updated at",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.updated_at),
    },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className=" self-center flex-none">
            <h4>{t("REPORTS_PAGE_TITLE")}</h4>
          </div>
        </div>
      }
      content={
        <div style={{ width: "100%" }}>
          {loading ? (
            <FuseLoading />
          ) : (
            <>
              {rows.length > 0 && columns.length > 0 && (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row._id}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  onRowDoubleClick={handleDoubleClick}
                />
              )}
            </>
          )}
        </div>
      }
      scroll="content"
    />
  );
};

export default withReducer("reportsPage", reducer)(withRouter(ReportsPage));
