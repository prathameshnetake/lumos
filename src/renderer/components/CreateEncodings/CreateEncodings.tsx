import React, { useCallback, useEffect } from "react";
import { ipcRenderer } from "electron";
import { useAppDispatch, useAppSelector } from "store";
import { update } from "../../reducers/createEncodings";

export const CreateEncodings = () => {
  const dispatch = useAppDispatch();
  const { direcorySource } = useAppSelector((state) => state.createEncodings);

  const open = () => {
    ipcRenderer.send("test");
  };

  const memoDirecortySelected = useCallback(
    (_: unknown, response: Electron.OpenDialogReturnValue) => {
      if (!response.canceled) {
        dispatch(update(response.filePaths[0]));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    ipcRenderer.on("directory-selected", memoDirecortySelected);

    return () => {
      ipcRenderer.off("directory-selected", memoDirecortySelected);
    };
  }, [dispatch, memoDirecortySelected]);

  const startIndxing = () => {
    console.log("Start inding the folder");
    ipcRenderer.send("start-images-indexing", direcorySource);
  };

  return (
    <div>
      <button type="button" onClick={open}>
        Choose Directory
      </button>
      <h2>{direcorySource}</h2>
      <button type="button" onClick={startIndxing}>
        start indexing
      </button>
    </div>
  );
};

export default CreateEncodings;
