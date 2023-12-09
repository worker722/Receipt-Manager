import { Server } from "@constants";
import FuseUtils from "@fuse/utils/FuseUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Skeleton } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { showMessage } from "app/store/fuse/messageSlice";
import moment from "moment";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { updateReceipt, uploadReceipt } from "./store/receiptSlice";

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  merchant_info: yup.string().required("You must enter merchant information."),
  issued_at: yup.date().required("You must enter expense issue date."),
  total_amount: yup.string().required("You must enter total amount."),
  currency: yup.string().required("You must enter transaction currency."),
  country_code: yup.string().required("You must enter merchant country code."),
});

const defaultValues = {
  merchant_info: "",
  issued_at: new Date().toISOString().substring(0, 10),
  total_amount: "",
  currency: "",
  country_code: "",
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "100%",
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: "100%",
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditReceiptModal({
  receipt = {},
  open = false,
  handleClose = {},
  handleAdded = {},
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const uploadInputRef = useRef(false);
  const [file, setFile] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState(false);
  const [receiptImage, setReceiptImage] = useState(false);

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors, setError } = formState;

  useEffect(() => {
    setValue("merchant_info", receipt?.merchant_info ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      "issued_at",
      moment(receipt?.issued_at).format("YYYY-MM-DD") ?? "",
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
    setValue("total_amount", receipt?.total_amount ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("currency", receipt?.currency ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("country_code", receipt?.country_code ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (receipt.image) {
      console.log(receipt.image);
      setReceiptImage(receipt.image);
    }
  }, [setValue, receipt]);

  const onSubmit = ({
    merchant_info,
    issued_at,
    total_amount,
    currency,
    country_code,
  }) => {
    setLoading(true);
    dispatch(
      updateReceipt({
        id: receipt._id,
        merchant_info,
        issued_at,
        total_amount,
        currency,
        country_code,
        image: receiptImage,
      })
    ).then((data) => {
      setLoading(false);
      if (!FuseUtils.isEmpty(data?.payload?.message)) {
        dispatch(
          showMessage({
            message: data.payload?.message,
            variant: "error",
          })
        );
      } else {
        if (!FuseUtils.isEmpty(data?.payload))
          handleAdded && handleAdded(data?.payload);
      }
    });
  };

  const handleUpload = (event) => {
    if (uploadInputRef?.current) {
      uploadInputRef.current.click();
    }
  };

  const handleChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      setLoading(true);
      dispatch(uploadReceipt(selectedFile)).then((data) => {
        setLoading(false);
        if (!FuseUtils.isEmpty(data?.payload?.message)) {
          dispatch(
            showMessage({
              message: data.payload?.message,
              variant: "error",
            })
          );
        } else {
          if (!FuseUtils.isEmpty(data?.payload)) {
            parseData(data.payload);
            setUploadedReceipt(data.payload);
          }
        }
      });
    }
  };

  const parseData = (data) => {
    const {
      issued_at,
      total_amount,
      currencyCode = "",
      currencySymbol,
    } = data?.data ?? {};
    const { pdf, image } = data.originFile;
    console.log({ data });

    if (issued_at) {
      setValue("issued_at", issued_at ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    setValue("total_amount", total_amount ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("currency", currencyCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (image[0] === ".") setReceiptImage(image.slice(1));
    else setReceiptImage("/" + image);
  };

  const _onClose = (event, reason) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      // Unknown event, cannot be closed without receipt interactions
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
        TransitionComponent={Transition}
        fullScreen
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Edit Receipt
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <div className=" flex pl-112 pr-112 h-full ">
            <div
              name={"fileUploadForm"}
              onClick={handleUpload}
              className="border-grey-600 border-solid rounded-6 border-2 cursor-pointer	justify-center items-center w-1/2	"
            >
              {!loading && receiptImage && (
                <img
                  src={`${Server.SERVER_URL}/${receiptImage}`}
                  className="w-full h-full object-contain"
                ></img>
              )}
              {loading && (
                <Skeleton
                  animation="wave"
                  width="100%"
                  height="100%"
                  className="scale-100"
                />
              )}
              <VisuallyHiddenInput
                ref={uploadInputRef}
                onChange={handleChange}
                accept="pdf/*"
                type="file"
              />
            </div>
            <div className=" w-full ml-40">
              <form
                name="editReceiptForm"
                noValidate
                className="flex flex-col justify-center w-full mt-32"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="merchant_info"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Description / Vendor"
                      type="name"
                      placeholder=""
                      error={!!errors.merchant_info}
                      helperText={errors?.merchant_info?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="issued_at"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Issued Date"
                      type="date"
                      error={!!errors.issued_at}
                      helperText={errors?.issued_at?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="total_amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Total"
                      type="number"
                      error={!!errors.total_amount}
                      helperText={errors?.total_amount?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Currency"
                      type="string"
                      error={!!errors.currency}
                      helperText={errors?.currency?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="country_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-24"
                      label="Country"
                      type="string"
                      error={!!errors.country_code}
                      helperText={errors?.country_code?.message}
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
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    color="success"
                    className=" w-full mt-10 "
                    aria-label="Create"
                    type="submit"
                    disabled={_.isEmpty(dirtyFields) || !isValid}
                  >
                    Update
                  </LoadingButton>
                </Box>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
