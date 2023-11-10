import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import FusePageSimple from "@fuse/core/FusePageSimple";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { getRoles, selectRoles } from "./store/rolesSlice";
import { useDispatch, useSelector } from "react-redux";
import withReducer from "app/store/withReducer";
import reducer from "./store";
import { useEffect, useState } from "react";
import EditRoleModal from "./EditRoleModal";
import { showMessage } from "app/store/fuse/messageSlice";
import FuseUtils from "@fuse/utils/FuseUtils";
import moment from "moment";
import FuseLoading from "@fuse/core/FuseLoading";

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

const ManageRolesPage = (props) => {
  const { t } = useTranslation("ManageRolesPage");

  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editRole, setEditRole] = useState({});
  const [rows, setRows] = useState([]);

  const dispatch = useDispatch();
  const { roles } = useSelector(selectRoles);

  useEffect(() => {
    setRows(roles);
  }, [roles]);

  useEffect(() => {
    setLoading(true);
    dispatch(getRoles()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      setLoading(false);
    });
  }, [dispatch]);

  const handleEditRole = (id) => () => {
    setEditRole(rows.find((role) => role._id == id));
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleUpdatedRole = (updatedRole) => {
    handleCloseEditModal();
    _showMessage("Successfully updated!", "info");
    setRows(
      rows.map((row) => (row._id === updatedRole._id ? updatedRole : row))
    );
  };

  const _showMessage = (message = "", variant = "info") => {
    dispatch(
      showMessage({
        message,
        variant,
      })
    );
  };

  const toLocalTime = (time) => {
    return moment.utc(time).local().format("YYYY-MM-DD hh:mm:ss");
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      valueGetter: (params) => {
        if (`${params.row.name}` == "admin") return "Administrator";
        else if (`${params.row.name}` == "staff") return "Staff";
        else if (`${params.row.name}` == "user") return "User";
      },
    },
    {
      field: "redirect_url",
      headerName: "Redirect URL",
      width: 200,
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
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditRole(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className="w-full self-center">
            <h4>{t("PAGE_TITLE")}</h4>
          </div>
        </div>
      }
      content={
        <div style={{ width: "100%" }}>
          {loading ? (
            <FuseLoading />
          ) : (
            <>
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
              {openEditModal && (
                <EditRoleModal
                  defaultValue={editRole}
                  open={openEditModal}
                  handleClose={handleCloseEditModal}
                  handleUpdated={handleUpdatedRole}
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

export default withReducer("manageRolesPage", reducer)(ManageRolesPage);
