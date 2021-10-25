import type {
  ComponentProps,
  ComponentType,
  ElementType,
  HTMLProps,
} from "react";
import React, { useRef } from "react";

import { Input } from "@canonical/react-components";
import { nanoid } from "@reduxjs/toolkit";
import { useField } from "formik";

export type Props<C extends ElementType | ComponentType = typeof Input> = {
  component?: C;
  name: string;
  value?: HTMLProps<HTMLElement>["value"];
} & ComponentProps<C>;

const FormikField = <C extends ElementType | ComponentType = typeof Input>({
  component: Component = Input,
  name,
  value,
  ...props
}: Props<C>): JSX.Element => {
  const id = useRef(nanoid());
  const [field, meta] = useField({ name, type: props.type, value });
  return (
    <Component
      error={meta.touched ? meta.error : null}
      id={id.current}
      {...field}
      {...props}
    />
  );
};

export default FormikField;
