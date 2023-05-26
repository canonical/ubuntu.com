import {
  CheckboxInput,
  ContextualMenu,
  MainTable,
  Row,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import { listAllKeys, rotateKey } from "advantage/credentials/api/keys";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

type ActivationKey = {
  contractItemID: string;
  expirationDate: Date;
  key: string;
  activatedBy?: string;
  productID: string;
};

enum KeyFilters {
  All,
  Unused,
  Active,
}

const KeyFiltersLength = Object.keys(KeyFilters).length / 2;

const CredManage = () => {
  const [tab, changeTab] = useState(0);
  const inputRefs = useRef<HTMLButtonElement[]>([]);
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

  const switchTab = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    event.preventDefault();
    if (event.key == "ArrowLeft") {
      changeTab((currentIndex - 1) % KeyFiltersLength);
      inputRefs.current[(currentIndex - 1) % KeyFiltersLength].focus();
    }
    if (event.key == "ArrowRight") {
      changeTab((currentIndex + 1) % KeyFiltersLength);
      inputRefs.current[(currentIndex + 1) % KeyFiltersLength].focus();
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
    console.log(keyValue, selectedKeyIds);
  };

  const selectAllKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyIds([]);
    if (event.target.checked) {
      setSelectedKeyIds(tableData.map((item) => item["key"]));
    }
  };

  const copyToClipboard = (value: string) => {
    console.log(value);
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
    if (tab == KeyFilters.All) {
      changeTableData(filterData);
    }
    if (tab == KeyFilters.Unused) {
      changeTableData(
        filterData.filter((keyItem: ActivationKey) => {
          return keyIsUnused(keyItem["key"]);
        })
      );
    }
    if (tab == KeyFilters.Active) {
      changeTableData(
        filterData.filter((keyItem: ActivationKey) => {
          return !keyIsUnused(keyItem["key"]);
        })
      );
    }
  }, [tab]);

  useEffect(() => {
    changeTab(0);
    changeFilterData(data);
    changeTableData(data);
  }, [data]);

  return (
    <div>
      <Row>
        <h1>Manage exam attempts</h1>
        <p>The table below shows exam attempts you have purchased</p>
        <p>
          To redeem an attempt, copy the associated key and paste it where the
          system asks you for the attempt key
        </p>
      </Row>
      <Row>
        <div className="p-segmented-control col-6">
          <div
            className="p-segmented-control__list"
            role="tablist"
            aria-label="Activatation Keys Table Filter"
          >
            <button
              className="p-segmented-control__button"
              role="tab"
              aria-selected={tab == 0}
              aria-controls="all-keys-tab"
              id="all-keys"
              onClick={() => {
                changeTab(0);
              }}
              onKeyUp={(e) => {
                switchTab(e, KeyFiltersLength);
              }}
              ref={(ref: HTMLButtonElement) => (inputRefs.current[0] = ref)}
            >
              All Keys
            </button>
            <button
              className="p-segmented-control__button"
              role="tab"
              aria-selected={tab == 1}
              aria-controls="unused-keys-tab"
              id="unused-keys"
              tabIndex={-1}
              onClick={() => {
                changeTab(1);
              }}
              onKeyUp={(e) => {
                switchTab(e, 1);
              }}
              ref={(ref: HTMLButtonElement) => (inputRefs.current[1] = ref)}
            >
              Unused Keys
            </button>
            <button
              className="p-segmented-control__button"
              role="tab"
              aria-selected={tab == 2}
              aria-controls="active-keys-tab"
              id="active-keys"
              tabIndex={-1}
              onClick={() => {
                changeTab(2);
              }}
              onKeyUp={(e) => {
                switchTab(e, 2);
              }}
              ref={(ref: HTMLButtonElement) => (inputRefs.current[2] = ref)}
            >
              Active Keys
            </button>
          </div>
        </div>
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
      <Row>
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
                          <Tooltip message="Copy Key" position="right">
                            <p>
                              {keyitem["key"]} &emsp;
                              <a
                                onClick={() => {
                                  copyToClipboard(keyitem.key);
                                }}
                              >
                                <i className="p-icon--copy"></i>
                              </a>
                            </p>
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
                            <Tooltip message="Refresh Key" position="right">
                              <p>
                                N/A &emsp;
                                <a
                                  onClick={() => {
                                    rotateActivationKeys([keyitem.key]);
                                  }}
                                >
                                  <i className="p-icon--restart"></i>
                                </a>
                              </p>
                            </Tooltip>
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
    </div>
  );
};
export default CredManage;
