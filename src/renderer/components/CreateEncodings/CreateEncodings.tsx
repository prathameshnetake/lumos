import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useAppDispatch, useAppSelector } from 'store';
import { update } from '../../reducers/createEncodings';

export const CreateEncodings = () => {
  const dispatch = useAppDispatch();
  const { direcorySource } = useAppSelector((state) => state.createEncodings);

  const open = () => {
    ipcRenderer.send('test');
  };

  const direcortySelected = (
    _: unknown,
    response: Electron.OpenDialogReturnValue
  ) => {
    if (!response.canceled) {
      dispatch(update(response.filePaths[0]));
    }
  };

  useEffect(() => {
    ipcRenderer.on('directory-selected', direcortySelected);

    return () => {
      ipcRenderer.off('directory-selected', direcortySelected);
    };
  }, []);

  return (
    <div>
      <button type="button" onClick={open}>
        Choose Directory
      </button>
      <h2>{direcorySource}</h2>
    </div>
  );
};

export default CreateEncodings;
