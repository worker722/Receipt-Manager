import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import FusePageSimple from "@fuse/core/FusePageSimple";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { deleteUser, getUsers, selectUsers } from "./store/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import withReducer from "app/store/withReducer";
import reducer from "./store";
import { useEffect, useState } from "react";
import EditUserModal from "./EditUserModal";
import AddUserModal from "./AddUserModal";
import { showMessage } from "app/store/fuse/messageSlice";
import FuseUtils from "@fuse/utils/FuseUtils";
import moment from "moment";
import Button from "@mui/material/Button";
import FuseLoading from "@fuse/core/FuseLoading";
import ConfirmDialog from "@fuse/core/ConfirmDialog";

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

const ManageUsersPage = (props) => {
  const { t } = useTranslation("ManageUsersPage");

  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [deleteUser_id, setDeleteUserID] = useState();
  const [rows, setRows] = useState([]);

  const dispatch = useDispatch();
  const { users } = useSelector(selectUsers);

  useEffect(() => {
    setRows(users);
  }, [users]);

  useEffect(() => {
    setLoading(true);
    dispatch(getUsers()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      setLoading(false);
    });
  }, [dispatch]);

  const handleAddUser = () => {
    setOpenAddModal(true);
  };

  const handleEditUser = (id) => () => {
    setEditUser(rows.find((user) => user._id == id));
    setOpenEditModal(true);
  };

  const handleDeleteUser = (id) => () => {
    setOpenDeleteDialog(true);
    setDeleteUserID(id);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    dispatch(deleteUser(deleteUser_id)).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        _showMessage("Deleted successfully", "info");
        setRows(rows.filter((row) => row._id !== deleteUser_id));
      }
    });
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleCreatedUser = (createdUser) => {
    handleCloseAddModal();

    _showMessage("Successfully added!", "info");
    setRows([...rows, createdUser]);
  };

  const handleUpdatedUser = (updatedUser) => {
    handleCloseEditModal();
    _showMessage("Successfully updated!", "info");
    setRows(
      rows.map((row) => (row._id === updatedUser._id ? updatedUser : row))
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
    { field: "name", headerName: "Full name", width: 200, editable: true },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "role",
      headerName: "Role",
      width: 160,
      valueGetter: (params) => {
        if (`${params.row.role.name}` == "admin") return "Administrator";
        else if (`${params.row.role.name}` == "staff") return "Staff";
        else if (`${params.row.role.name}` == "user") return "User";
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
    {
      field: "active",
      headerName: "Active",
      valueGetter: (params) => {
        if (params.row.active == 1) return "Actived";
        else if (params.row.active == 0) return "Blocked";
      },
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
            onClick={handleEditUser(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteUser(id)}
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
          <div className="float-right">
            <Button
              onClick={handleAddUser}
              variant="contained"
              color="primary"
              aria-label="Add"
            >
              Add
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
                <EditUserModal
                  defaultValue={editUser}
                  open={openEditModal}
                  handleClose={handleCloseEditModal}
                  handleUpdated={handleUpdatedUser}
                />
              )}
              {openAddModal && (
                <AddUserModal
                  open={openAddModal}
                  handleClose={handleCloseAddModal}
                  handleAdded={handleCreatedUser}
                />
              )}
              {openDeleteDialog && (
                <ConfirmDialog
                  open={openDeleteDialog}
                  onCancel={() => setOpenDeleteDialog(false)}
                  onAccept={handleConfirmDelete}
                  question="Do you want to delete this user?"
                  message="If you delete this user, all related receipts and bank expenses will be deleted."
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

export default withReducer("manageUsersPage", reducer)(ManageUsersPage);
