import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseUtils from "@fuse/utils/FuseUtils";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  createExpense,
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

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const a11yProps = (index) => {
  return {
    id: `expense-tab-${index}`,
    "aria-controls": `expense-tabpanel-${index}`,
  };
};

const ManageExpensesPage = (props) => {
  const { t } = useTranslation("ManageExpensesPage");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [tabs, setTabs] = useState([]);

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

  const handleUploadExpenseFile = (event) => {
    if (event.target.files.length == 0) return;

    setLoading(true);
    dispatch(createExpense(event.target.files[0])).then((data) => {
      getAll();
    });
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
      field: "trader_company_name",
      headerName: "Raison sociale commerçant",
      width: 250,
    },
    {
      field: "treatmented_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.treatmented_at),
    },
    { field: "amount_charged", headerName: "Amount EUR", width: 100 },
    {
      field: "total_amount_original_currency",
      headerName: "Amount Currency",
      width: 150,
    },
    {
      field: "origin_currency_code",
      headerName: "Currency",
      width: 100,
    },
    { field: "country_code", headerName: "Country", width: 100 },
    { field: "locality", headerName: "City", width: 150 },
    { field: "commission_amount_1", headerName: "Vat 1", width: 100 },
    { field: "commission_amount_2", headerName: "Vat 2", width: 100 },
    { field: "commission_amount_3", headerName: "Vat 3", width: 100 },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className=" self-center flex-none">
            <h4>{t("PAGE_TITLE")}</h4>
          </div>
          <div className=" pl-32 pr-32 w-10/12">
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
          <div className=" mt-5 w-full">
            <Button
              component="label"
              variant="contained"
              color="primary"
              className=" float-right"
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <VisuallyHiddenInput
                onChange={handleUploadExpenseFile}
                accept=".xlsx, .xls, .csv"
                type="file"
              />
            </Button>
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

export default withReducer("manageExpensesPage", reducer)(ManageExpensesPage);
