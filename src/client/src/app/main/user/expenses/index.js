import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import withRouter from "@fuse/core/withRouter";
import FuseUtils from "@fuse/utils/FuseUtils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { showMessage } from "app/store/fuse/messageSlice";
import withReducer from "app/store/withReducer";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import reducer from "./store";
import {
  createNewReport,
  getExpenses,
  selectExpenses,
} from "./store/expensesSlice";

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

const a11yProps = (index) => {
  return {
    id: `expense-tab-${index}`,
    "aria-controls": `expense-tabpanel-${index}`,
  };
};

const AllExpensesPage = (props) => {
  const { t } = useTranslation("AllExpensesPage");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [tabs, setTabs] = useState([]);

  const [selectionModel, setSelectionModel] = useState(() =>
    rows.filter((r) => r)
  );
  const [selectedRows, setSelectedRows] = useState([]);

  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    setTabData(newValue);
  };

  const dispatch = useDispatch();
  const { expenses } = useSelector(selectExpenses);

  useEffect(() => {
    if (expenses.length > 0) {
      var tab_data = [];
      expenses.forEach((item) => {
        tab_data.push({
          title: `${item.filter.year}/${item.filter.month}`,
        });
      });
      setTabs(tab_data);
      setTabData(0);
    }
  }, [expenses]);

  const setTabData = (tabIndex) => {
    if (expenses.length > tabIndex) setRows(expenses[tabIndex].data);
    else setRows([]);
  };

  useEffect(() => {
    getAll();
  }, [dispatch]);

  const getAll = () => {
    setLoading(true);
    dispatch(getExpenses()).then((data) => {
      const { message = "" } = data.payload;

      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      setLoading(false);
    });
  };

  const handleCreateReport = () => {
    setLoading(true);
    dispatch(createNewReport(selectedRows.map((item) => item._id))).then(
      (data) => {
        const { message = "" } = data.payload ?? {};
        if (!FuseUtils.isEmpty(message)) {
          _showMessage(message, "error");
        }
        if (data?.payload?.report) {
          props.navigate(`/me/reports/${data?.payload?.report.public_id}`);
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log(selectedRows);
  }, [selectedRows]);

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
      field: "treatmented_at",
      headerName: "Treatment Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.treatmented_at),
    },
    {
      field: "contracting_by_number",
      headerName: "Contracting by Number",
      width: 200,
    },
    { field: "contract_number", headerName: "Contract Number", width: 150 },
    {
      field: "operation_location_code",
      headerName: "Operation Location Code",
      width: 150,
    },
    { field: "titular_name", headerName: "Titular Name", width: 100 },
    {
      field: "employee_identifier",
      headerName: "Employee Identifier",
      width: 100,
    },
    { field: "card_number", headerName: "Card Number", width: 150 },
    {
      field: "card_created_at",
      headerName: "Card Create Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.card_created_at),
    },
    {
      field: "sold_at",
      headerName: "Sale Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.sold_at),
    },
    {
      field: "closed_at",
      headerName: "Closed Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.closed_at),
    },
    {
      field: "taken_into_account_at",
      headerName: "Taken Into Account Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.taken_into_account_at),
    },
    { field: "operation_code", headerName: "Operation Code", width: 150 },
    {
      field: "under_code_operation",
      headerName: "Under Operation Code",
      width: 150,
    },
    {
      field: "direction_of_operation",
      headerName: "Direction of Operation",
      width: 150,
    },
    { field: "amount_charged", headerName: "Amount Charged", width: 150 },
    {
      field: "origin_currency_code",
      headerName: "Origin Currency Code",
      width: 150,
    },
    {
      field: "total_amount_original_currency",
      headerName: "Total Amount Original Currency",
      width: 150,
    },
    {
      field: "trader_company_name",
      headerName: "Trader Company Name",
      width: 150,
    },
    { field: "code_department", headerName: "Code Department", width: 150 },
    { field: "country_code", headerName: "Country Code", width: 150 },
    { field: "locality", headerName: "Locality", width: 150 },
    { field: "code_mcc", headerName: "Code Mcc", width: 150 },
    { field: "operation_time", headerName: "Operation Time", width: 150 },
    { field: "execution_area", headerName: "Execution Area", width: 150 },
    {
      field: "merchant_siret_number",
      headerName: "Merchat Siret Number",
      width: 150,
    },
    { field: "commission_amount_1", headerName: "Commission 1", width: 150 },
    { field: "commission_amount_2", headerName: "Commission 2", width: 150 },
    { field: "commission_amount_3", headerName: "Commission 3", width: 150 },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className=" self-center flex-none">
            <h4>{t("PAGE_TITLE")}</h4>
          </div>
          <div className=" justify-center self-center ml-20">
            <Button
              component="label"
              variant="contained"
              color="primary"
              disabled={selectedRows.length == 0}
              onClick={handleCreateReport}
            >
              Create Report
            </Button>
          </div>
          <div className=" pl-32 pr-32 w-8/12">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="secondary"
                aria-label="expense month filter tab"
                style={{ overflow: "auto" }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    tabIndex={index}
                    label={`${tab.title}`}
                    key={index}
                    {...a11yProps(index)}
                  />
                ))}
              </Tabs>
            </Box>
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
                  selectionModel={selectionModel}
                  onRowSelectionModelChange={(e) => {
                    setSelectionModel(e);
                    const selectedIDs = new Set(e);
                    const selectedRows = rows.filter((r) =>
                      selectedIDs.has(r._id)
                    );
                    setSelectedRows(selectedRows);
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection
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

export default withReducer(
  "allExpensesPage",
  reducer
)(withRouter(AllExpensesPage));
