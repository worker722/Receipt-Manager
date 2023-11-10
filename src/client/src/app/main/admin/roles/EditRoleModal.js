import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateRole } from "./store/rolesSlice";
import { Box } from "@mui/material";
import FuseLoading from "@fuse/core/FuseLoading";
import FuseUtils from "@fuse/utils/FuseUtils";
import { showMessage } from "app/store/fuse/messageSlice";

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  redirect_url: yup.string().required("You must enter redirect url"),
});

const defaultValues = {
  redirect_url: "/",
};

export default function EditRoleModal({
  defaultValue = {},
  open = false,
  handleClose = {},
  handleUpdated = {},
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors, setError } = formState;

  useEffect(() => {
    setValue("redirect_url", defaultValue?.redirect_url ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, defaultValue]);

  const onSubmit = ({ redirect_url }) => {
    setLoading(true);
    dispatch(
      updateRole({
        _id: defaultValue._id,
        redirect_url,
      })
    ).then((data) => {
      setLoading(false);
      if (!FuseUtils.isEmpty(data.payload?.message)) {
        dispatch(
          showMessage({
            message: data.payload?.message,
            variant: "error",
          })
        );
      } else {
        if (!FuseUtils.isEmpty(data?.payload)) handleUpdated(data.payload);
      }
    });
  };

  const _onClose = (event, reason) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      // Unknown event, cannot be closed without role interactions
    } else {
      // Can be added saving change confirmation like: 'There are some unsaved changes. Do you want to leave?'
      handleClose && handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={_onClose}
        aria-labelledby="fuse-dialog-title"
        maxWidth={"sm"}
        fullWidth={true}
        classes={{
          paper: "rounded-8",
        }}
      >
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <form
            name="updateRoleForm"
            noValidate
            className="flex flex-col justify-center w-full mt-32"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="redirect_url"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-24"
                  label="Redirect URL"
                  autoFocus
                  type="url"
                  placeholder="/example"
                  error={!!errors.redirect_url}
                  helperText={errors?.redirect_url?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Box>
              <Button
                variant="outlined"
                color={"error"}
                className="w-full mt-20"
                disabled={loading}
                aria-label="Cancel"
                onClick={_onClose}
              >
                Cancel
              </Button>
              {!loading ? (
                <Button
                  variant="contained"
                  color="success"
                  className=" w-full mt-10 "
                  aria-label="Save"
                  type="submit"
                  disabled={_.isEmpty(dirtyFields) || !isValid}
                >
                  Save
                </Button>
              ) : (
                <FuseLoading showLabel={false} delay={0} />
              )}
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
