/**
 * Created by michbil on 16.07.17.
 */

import { COVER_DIALOG_OPEN, COVER_DIALOG_CLOSE } from '../actions/coverDialog';
import EditorReducerMaker from './editorReducer';
import JSONDocument from 'base/jsonld/LdJsonDocument';
import JSONToDraft from '../DraftConverters/cover/JSONToDraft';
import { mkDoc, extractHeader } from './docUtils';

const DEFAULT_COVER = 'https://webrunes.com/img/cover1.png';

function newCover() {
  return {
    '@type': 'ImageObject',
    name: '',
    thumbnail: DEFAULT_COVER,
    contentUrl: DEFAULT_COVER,
    about: 'Cover',
    text: [' '],
  };
}

const CoverEditorReducer = function CoverEditorReducer(state, action) {
  switch (action.type) {
    case 'COVER_DIALOG_OPEN': {
      let docs;
      const coverElement = action.cover.itemListElement[0];
      if (action.cover) {
        docs = new JSONDocument([coverElement]);
      } else {
        docs = new JSONDocument([newCover()]);
      }
      const doctempl = mkDoc(state, docs, JSONToDraft);
      return doctempl;
    }
    default:
      return EditorReducerMaker('COVEREDITOR_')(state, action);
  }
};

const defaultState = {
  showDialog: false,
  imageUrl: '',
  subEdtior: CoverEditorReducer(undefined, { type: '@INIT' }),
};

export function coverDialogReducer(state = defaultState, action) {
  switch (action.type) {
    case 'COVER_DIALOG_IMAGE_URL_CHANGED':
      return { ...state, imageUrl: action.url };
    case COVER_DIALOG_OPEN: {
      const subEdtior1 = CoverEditorReducer(state.subEdtior, action);
      const imageUrl = action.cover ? action.cover.itemListElement[0].contentUrl : DEFAULT_COVER;
      return {
        ...state,
        imageUrl,
        subEdtior: subEdtior1,
        showDialog: true,
      };
    }
    case COVER_DIALOG_CLOSE:
      return { ...state, showDialog: false };

    default: {
      const subEdtior = CoverEditorReducer(state.subEdtior, action);
      return { ...state, subEdtior };
    }
  }
}

export default coverDialogReducer;