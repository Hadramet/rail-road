import {
  Box,
  CardContent,
  Card,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { withFormik, FormikProps, FormikErrors, Form } from "formik";
import { OtherProps } from "../interfaces/OtherProps";
import { AddCardFormValues } from "../interfaces/AddCardFormValues";
import { AddCardProps } from "../interfaces/AddCardProps";

const AddCardFormView = (
  props: OtherProps & FormikProps<AddCardFormValues>
) => {
  const {
    touched,
    errors,
    values,
    handleChange,
    handleBlur,
    isSuccess,
    isLoading,
    error,
    isError,
    hash,
  } = props;
  return (
    <Form>
      {isSuccess && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Alert severity="success">
            <Typography variant="caption">
              <div>Transaction successfully completed</div>
              <div>
                <a href={`https://etherscan.io/tx/${hash}`}>Etherscan</a>
              </div>
            </Typography>
          </Alert>
        </Box>
      )}
      {isError && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Alert severity="error">
            <Typography variant="caption">
              <div>{error?.message}</div>
            </Typography>
          </Alert>
        </Box>
      )}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6"> Add Card </Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <TextField
                label="Card Id"
                name="cardId"
                fullWidth
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.cardId && errors.cardId)}
                helperText={touched.cardId && errors.cardId}
                value={values.cardId}
              />
              <TextField
                sx={{ mb: 2, mt: 2 }}
                label="Card Price"
                name="cardPrice"
                fullWidth
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.cardPrice && errors.cardPrice)}
                helperText={touched.cardPrice && errors.cardPrice}
                value={values.cardPrice}
                InputProps={{
                  placeholder: "100000000",
                  endAdornment: (
                    <InputAdornment position="start">WEI</InputAdornment>
                  ),
                }}
              />
              <TextField
                sx={{ mb: 2 }}
                label="Total Sellable"
                name="cardTotalSellable"
                fullWidth
                InputProps={{
                  placeholder: "5000",
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(
                  touched.cardTotalSellable && errors.cardTotalSellable
                )}
                helperText={
                  touched.cardTotalSellable && errors.cardTotalSellable
                }
                value={values.cardTotalSellable}
              />
              <TextField
                sx={{ mb: 2 }}
                label="Discount"
                name="cardDiscount"
                fullWidth
                InputProps={{
                  placeholder: "50",
                  endAdornment: (
                    <InputAdornment position="start">%</InputAdornment>
                  ),
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.cardDiscount && errors.cardDiscount)}
                helperText={touched.cardDiscount && errors.cardDiscount}
                value={values.cardDiscount}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <LoadingButton
          sx={{ m: 1, ml: "auto" }}
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          variant="contained"
        >
          Create
        </LoadingButton>
      </Box>
    </Form>
  );
};

export const AddCardForm = withFormik<AddCardProps, AddCardFormValues>({
  mapPropsToValues: (props: AddCardProps) => {
    return {
      cardId: props.initialId || undefined,
      cardPrice: props.initialPrice || undefined,
      cardDiscount: props.initialDiscount || undefined,
      cardTotalSellable: props.initialTotal || undefined,
    };
  },
  validate: (values: AddCardFormValues) => {
    let errors: FormikErrors<AddCardFormValues> = {};
    if (!values.cardId) errors.cardId = "Required";
    if (!values.cardDiscount) errors.cardDiscount = "Required";
    if (!values.cardPrice) errors.cardPrice = "Required";
    if (!values.cardTotalSellable) errors.cardTotalSellable = "Required";
    return errors;
  },
  handleSubmit: (values, actions) => {
    actions.props.addCardHandle(values);
    actions.setSubmitting(false);
  },
})(AddCardFormView);
