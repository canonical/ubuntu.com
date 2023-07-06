import {
  CheckboxInput,
  Col,
  ContextualMenu,
  MainTable,
  Row,
  Spinner,
  Strip,
  Tabs,
  Tooltip,
} from "@canonical/react-components";
import { listAllKeys, rotateKey } from "advantage/credentials/api/keys";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

type ActivationKey = {
  contractItemID: string;
  expirationDate: Date;
  key: string;
  activatedBy?: string;
  productID: string;
};

enum ActiveTab {
  AllKeys,
  UnusedKeys,
  ActiveKeys,
}

const KeyFiltersLength = Object.keys(ActiveTab).length / 2;

const CredManage = () => {
  const [activeTab, setTab] = useState(ActiveTab.AllKeys);
  const [actionLinks, updateActionLinks] = useState<
    { children: string; onClick: () => void }[]
  >([]);
  const { isLoading, data } = useQuery(["ActivationKeys"], async () => {
    return listAllKeys();
  });

  const [filterData, changeFilterData] = useState<ActivationKey[]>(data);
  const [tableData, changeTableData] = useState<ActivationKey[]>(data);

  const rotateActivationKeys = async (keyIds: string[]) => {
    let i = 0;
    const temp: { [key: string]: string } = {};
    while (i < keyIds.length) {
      await rotateKey(keyIds[i]).then((response) => {
        temp[keyIds[i]] = response["activationKey"];
        i++;
      });
    }
    changeFilterData(
      filterData.map((row: ActivationKey) =>
        row["key"] in temp ? { ...row, key: temp[row["key"]] } : { ...row }
      )
    );
    changeTableData(
      tableData.map((row) =>
        row["key"] in temp ? { ...row, key: temp[row["key"]] } : { ...row }
      )
    );
  };

  const switchTabOnArrowPress = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    currentIndex = activeTab;
    event.preventDefault();
    if (event.key == "ArrowLeft") {
      setTab((currentIndex - 1) % KeyFiltersLength);
    }
    if (event.key == "ArrowRight") {
      setTab((currentIndex + 1) % KeyFiltersLength);
    }
  };

  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);

  const getKey = (keyId: string) => {
    for (const d in filterData) {
      if (filterData[d]["key"] == keyId) {
        return filterData[d];
      }
    }
    return {};
  };

  const handleCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    keyValue: string
  ) => {
    if (event.target.checked == true) {
      setSelectedKeyIds(selectedKeyIds.concat(keyValue));
    } else {
      setSelectedKeyIds((selectedKeyIds) =>
        selectedKeyIds.filter((id) => id != keyValue)
      );
    }
  };

  const selectAllKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyIds([]);
    if (event.target.checked) {
      setSelectedKeyIds(tableData.map((item) => item["key"]));
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const keyIsUnused = (keyItemId: string) => {
    const tempKey = getKey(keyItemId);
    if ("activatedBy" in tempKey) {
      return false;
    }
    return true;
  };

  const isUnused = () => {
    for (let i = 0; i < selectedKeyIds.length; i++) {
      if (!keyIsUnused(selectedKeyIds[i])) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const newList = [];
    if (isUnused()) {
      newList.push({
        children: "Copy List",
        onClick: () => {
          navigator.clipboard.writeText(selectedKeyIds.join(","));
        },
      });
      newList.push({
        children: "Refresh Keys",
        onClick: () => {
          rotateActivationKeys(selectedKeyIds);
          setSelectedKeyIds([]);
        },
      });
    }
    if (newList.length == 0) {
      newList.push({
        children: "No bulk options available",
        onClick: () => {},
      });
    }
    updateActionLinks(newList);
  }, [selectedKeyIds]);

  useEffect(() => {
    if (activeTab == ActiveTab.AllKeys) {
      changeTableData(filterData);
    }
    if (activeTab == ActiveTab.UnusedKeys) {
      changeTableData(
        filterData.filter((keyItem: ActivationKey) => {
          return keyIsUnused(keyItem["key"]);
        })
      );
    }
    if (activeTab == ActiveTab.ActiveKeys) {
      changeTableData(
        filterData.filter((keyItem: ActivationKey) => {
          return !keyIsUnused(keyItem["key"]);
        })
      );
    }
  }, [activeTab]);

  useEffect(() => {
    setTab(ActiveTab.AllKeys);
    changeFilterData(data);
    changeTableData(data);
  }, [data]);

  return (
    <div>
      <Strip>
        <Row>
          <Col size={6}>
            <h1>
              <strong>Manage exam attempts</strong>
            </h1>
          </Col>
          <Col size={6}>
            <p>
              {" "}
              The table below shows exam attempts you have purchased.
              <br />
              To redeem an attempt, copy the associated key and paste it where
              the system asks you for the attempt key
            </p>
          </Col>
        </Row>
      </Strip>
      <Strip className="u-no-padding--top">
        <Row>
          <Tabs
            links={[
              {
                id: "tab-" + ActiveTab.AllKeys,
                role: "tab",
                active: activeTab === ActiveTab.AllKeys,
                tabindex: 0,
                label: "All keys",
                onClick: () => setTab(ActiveTab.AllKeys),
                onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) =>
                  switchTabOnArrowPress(e, ActiveTab.AllKeys),
              },
              {
                id: "tab-" + ActiveTab.UnusedKeys,
                role: "tab",
                active: activeTab === ActiveTab.UnusedKeys,
                tabindex: -1,
                label: "Unused keys",
                onClick: () => setTab(ActiveTab.UnusedKeys),
                onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) =>
                  switchTabOnArrowPress(e, ActiveTab.UnusedKeys),
              },
              {
                id: "tab-" + ActiveTab.ActiveKeys,
                role: "tab",
                active: activeTab === ActiveTab.ActiveKeys,
                tabindex: -1,
                label: "Active keys",
                onClick: () => setTab(ActiveTab.ActiveKeys),
                onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) =>
                  switchTabOnArrowPress(e, ActiveTab.ActiveKeys),
              },
            ]}
          ></Tabs>
          <div className="col-6 u-align--center">
            {selectedKeyIds.length > 0 ? (
              <ContextualMenu
                hasToggleIcon
                links={actionLinks}
                position="right"
                toggleLabel="Actions"
              />
            ) : (
              ""
            )}
          </div>
        </Row>
        <Row role="tabpanel">
          {isLoading ? (
            <Spinner />
          ) : (
            <MainTable
              headers={[
                {
                  content: (
                    <CheckboxInput
                      onChange={selectAllKeys}
                      label=""
                      checked={
                        tableData != undefined &&
                        selectedKeyIds.length == tableData.length
                      }
                    />
                  ),
                  colSpan: 1,
                },
                {
                  content: "Exam Key Id",
                  sortKey: "key",
                  colSpan: 2,
                },
                {
                  content: "Assignee",
                  sortKey: "activatedBy",
                  colSpan: 2,
                },
                {
                  content: "Exam",
                  sortKey: "productID",
                },
                {
                  content: "Expiration Date",
                  sortKey: "expirationDate",
                },
              ]}
              rows={
                tableData &&
                tableData.map((keyitem: ActivationKey) => {
                  return {
                    columns: [
                      {
                        content: (
                          <CheckboxInput
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              handleCheckbox(event, keyitem["key"]);
                            }}
                            label=""
                            id={keyitem["key"] + "_checkbox"}
                            checked={selectedKeyIds.includes(keyitem["key"])}
                          />
                        ),
                      },
                      {
                        content: (
                          <>
                            <span>{keyitem["key"]} &emsp;</span>
                            <Tooltip message="Copy Key" position="btm-center">
                              <a
                                onClick={() => {
                                  copyToClipboard(keyitem.key);
                                }}
                              >
                                <i className="p-icon--copy"></i>
                              </a>
                            </Tooltip>
                          </>
                        ),
                        colSpan: 2,
                      },
                      {
                        content: (
                          <>
                            {keyitem["activatedBy"] ? (
                              <p>{keyitem["activatedBy"]} &emsp;</p>
                            ) : (
                              <>
                                <span>N/A &emsp;</span>
                                <Tooltip
                                  message="Refresh Key"
                                  position="btm-center"
                                >
                                  <a
                                    onClick={() => {
                                      rotateActivationKeys([keyitem.key]);
                                    }}
                                  >
                                    <i className="p-icon--restart"></i>
                                  </a>
                                </Tooltip>
                                <span>&emsp;</span>
                                <Tooltip
                                  message="Redeem Key"
                                  position="btm-center"
                                >
                                  <a
                                    href={`/credentials/redeem/${keyitem["key"]}?action=confirm`}
                                  >
                                    <i className="p-icon--video-play"></i>
                                  </a>
                                </Tooltip>
                              </>
                            )}
                          </>
                        ),
                        colSpan: 2,
                      },
                      {
                        content: keyitem.productID,
                      },
                      {
                        content: keyitem.expirationDate.toString(),
                      },
                    ],
                    sortData: {
                      ...keyitem,
                      checkbox: keyitem["key"],
                    },
                  };
                })
              }
              paginate={5}
              sortable
              responsive
            />
          )}
        </Row>
      </Strip>
    </div>
  );
};
export default CredManage;
