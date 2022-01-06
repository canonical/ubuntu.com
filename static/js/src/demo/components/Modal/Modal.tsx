import React, { useRef } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import {
  useOverlay,
  usePreventScroll,
  useModal,
  OverlayContainer,
} from "@react-aria/overlays";
import { useDialog } from "@react-aria/dialog";
import { FocusScope } from "@react-aria/focus";
import { useButton } from "@react-aria/button";

//{ title, children, isOpen, onClose, isDismissable }

type Props = {
  title: string;
  children: any;
  closeButtonProps: any;
  closeButtonRef: any;
};

const ModalDialog = (props: Props) => {
  const { title, children, closeButtonProps, closeButtonRef } = props;
  const ref = useRef();
  const { overlayProps, underlayProps } = useOverlay(props, ref);

  usePreventScroll();
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog(props, ref);

  return (
    <>
      <div className="p-modal" {...underlayProps}>
        <FocusScope contain restoreFocus autoFocus>
          <section
            className="p-modal__dialog"
            {...overlayProps}
            {...dialogProps}
            {...modalProps}
            ref={ref}
          >
            <header className="p-modal__header">
              <h2 className="p-modal__title" {...titleProps}>
                {title}
              </h2>
              <button
                className="p-modal__close"
                {...closeButtonProps}
                ref={closeButtonRef}
              >
                Close
              </button>
            </header>
            {children}
          </section>
        </FocusScope>
      </div>
    </>
  );
};

const Modal = () => {
  const state = useOverlayTriggerState({});
  const openButtonRef = React.useRef<HTMLButtonElement>();
  const closeButtonRef = React.useRef<HTMLButtonElement>();

  const { buttonProps: openButtonProps } = useButton(
    {
      onPress: () => state.open(),
    },
    openButtonRef
  );

  const { buttonProps: closeButtonProps } = useButton(
    { onPress: () => state.close() },
    closeButtonRef
  );

  return (
    <>
      <button {...openButtonProps} ref={openButtonRef}>
        Open modal...
      </button>
      {state.isOpen && (
        <OverlayContainer>
          <ModalDialog
            title="Modal title"
            isOpen
            onClose={state.close}
            isDismissable
            closeButtonProps={closeButtonProps}
            closeButtonRef={closeButtonRef}
          >
            <p>This is an accessible modal using React-Aria</p>
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
          </ModalDialog>
        </OverlayContainer>
      )}
    </>
  );
};

export default Modal;
