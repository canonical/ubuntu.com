import {
  Button,
  Col,
  Row,
  Input,
  Accordion,
} from "@canonical/react-components";
import React, { ChangeEvent } from "react";

const onCodeSubmit = () => {
  if (window.localStorage.getItem("isLoggedIn") == "false") {
    window.location.href = "/login?next=/advantage/magic-attach";
  } else {
    window.location.reload();
  }
};
const keys = {
  left: "ArrowLeft",
  right: "ArrowRight",
};

const direction = {
  ArrowLeft: -1,
  ArrowRight: 1,
};
function attachEvents(tabs) {
  tabs.forEach(function (tab, index) {
    tab.addEventListener("keyup", function (e) {
      if (e.code === keys.left || e.code === keys.right) {
        switchTabOnArrowPress(e, tabs);
      }
    });

    tab.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveTab(tab, tabs);
    });

    tab.addEventListener("focus", function () {
      setActiveTab(tab, tabs);
    });

    tab.index = index;
  });
}

function switchTabOnArrowPress(event, tabs) {
  let pressed = event.code;

  if (direction[pressed]) {
    let target = event.target;
    if (target.index !== undefined) {
      if (tabs[target.index + direction[pressed]]) {
        tabs[target.index + direction[pressed]].focus();
      } else if (pressed === keys.left) {
        tabs[tabs.length - 1].focus();
      } else if (pressed === keys.right) {
        tabs[0].focus();
      }
    }
  }
}

function setActiveTab(tab: Element, tabs: List[Element]) {
  tabs.forEach(function (tabElement: Element) {
    const tabContent = document.getElementById(
      tabElement.getAttribute("aria-controls")
    );

    if (tabElement === tab) {
      tabElement.setAttribute("aria-selected", true);
      tabContent.removeAttribute("hidden");
    } else {
      tabElement.setAttribute("aria-selected", false);
      tabContent.setAttribute("hidden", true);
    }
  });
}

const selector = '[role="tablist"]';
const tabContainers = [].slice.call(document.querySelectorAll(selector));

tabContainers.forEach(function (tabContainer: Element) {
  const tabs = [].slice.call(tabContainer.querySelectorAll("[aria-controls]"));
  attachEvents(tabs);
});

const MagicAttachCode = () => {
  return (
    <>
      <Row>
        <Col
          size={6}
          className="inside col-12 col-start-large-4 u-align--center"
        >
          <Input
            type="text"
            id="exampleTextInput3"
            label="Enter the code displayed in your installation"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              window.localStorage.setItem(
                "magicAttachCode",
                event.target.value
              );
            }}
          />
          <Button appearance="positive" onClick={onCodeSubmit}>
            Submit
          </Button>
        </Col>
      </Row>
      <Accordion
        sections={[
          {
            content: (
              <>
                <div className="p-segmented-control">
                  <div
                    className="p-segmented-control__list"
                    role="tablist"
                    aria-label="Juju technology"
                  >
                    <button
                      className="p-segmented-control__button"
                      role="tab"
                      aria-selected="true"
                      aria-controls="desktop-tab"
                      id="desktop"
                    >
                      Desktop
                    </button>
                    <button
                      className="p-segmented-control__button"
                      role="tab"
                      aria-selected="false"
                      aria-controls="server-tab"
                      id="server"
                      tabIndex={-1}
                    >
                      Server
                    </button>
                  </div>
                </div>
                <div
                  tabIndex={0}
                  role="tabpanel"
                  id="desktop-tab"
                  aria-labelledby="desktop"
                >
                  <p>
                    A system to help you move from configuration management to
                    application management across your hybrid cloud estate -
                    through sharable, reusable, tiny applications called Charmed
                    Operators.
                  </p>
                </div>

                <div
                  tabIndex={0}
                  role="tabpanel"
                  id="server-tab"
                  aria-labelledby="server"
                  hidden
                >
                  <p>
                    A set of tools to help you write Charmed Operators and to
                    package them as Charms.
                  </p>
                </div>
              </>
            ),
            title: "Where can I find the Ubuntu Pro installer code?",
          },
        ]}
        titleElement="h3"
      />
    </>
  );
};

export default MagicAttachCode;
