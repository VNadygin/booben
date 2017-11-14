import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import camelCase from 'lodash.camelcase';
import transform from 'lodash.transform';
import { getPlatformName } from 'react-shortcuts/lib/helpers';
import { Dialog, Theme } from '@reactackle/reactackle';
import keymap from '../../keymap';
import { getLocalizedTextFromState } from '../../selectors';

import {
  ShortcutsList,
  ShortcutsGroup,
  ShortcutItem,
} from '../../components/shortcuts';

const getLocalizedShortcuts = state => {
  const NAMESPACE = 'shortcuts';
  const currentPlatform = getPlatformName();
  const localize = getLocalizedTextFromState(state);

  return transform(keymap, (resGroup, shortcuts, groupName) => {
    const camelGroupName = camelCase(groupName);
    const localizedGroupName = localize(`${NAMESPACE}.${camelGroupName}`);
    const localizedShortcuts =
      transform(shortcuts, (resShortcuts, key, shortcutName) => {
        const localizedShortcutName =
          localize(`${NAMESPACE}.${camelGroupName}.${camelCase(shortcutName)}`);

        const platformKey = key[currentPlatform] || key;
        resShortcuts[localizedShortcutName] =
          platformKey.replace(/\+/g, ` +${String.fromCharCode(160)}`);
      }, {});

    resGroup[localizedGroupName] = localizedShortcuts;
  }, {});
};

const propTypes = {
  ...Dialog.propTypes,
  ButtonComponent: PropTypes.func.isRequired,
  localizedShortcuts: PropTypes.object.isRequired,
};

const defaultProps = Dialog.defaultProps;

const mapStateToProps = state => ({
  localizedShortcuts: getLocalizedShortcuts(state),
  localize: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const reactackleThemeMixin = {
  components: {
    dialog: {
      window: {
        maxWidth: 1000,
      },
    },
  },
};

class _ShortcutsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this._handleClose = this._handleClose.bind(this);
    this._handleOpen = this._handleOpen.bind(this);
  }

  _handleOpen() {
    this.setState({ isOpen: true });
  }

  _handleClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const {
      ButtonComponent,
      localizedShortcuts,
      localize,
    } = this.props;

    const shortcuts =
      Object.entries(localizedShortcuts).map(([groupName, shortcuts]) => {
        const keys = Object.entries(shortcuts).map(([shortcutName, key]) =>
          <ShortcutItem
            key={`${shortcutName}.${key}`}
            shortcut={key}
            description={shortcutName}
          />,
        );

        return (
          <ShortcutsGroup key={groupName} title={groupName}>
            {keys}
          </ShortcutsGroup>
        );
      });

    return [
      <ButtonComponent key="sc-dialog-button" onClick={this._handleOpen} />,

      <Theme key="sc-dialog" mixin={reactackleThemeMixin}>
        <Dialog
          open={this.state.isOpen}
          onClose={this._handleClose}
          title={localize('shortcuts.dialogTitle')}
          haveCloseButton
          closeOnEscape
        >
          <ShortcutsList>
            {shortcuts}
          </ShortcutsList>
        </Dialog>
      </Theme>,
    ];
  }
}

_ShortcutsDialog.propTypes = propTypes;
_ShortcutsDialog.defaultProps = defaultProps;
_ShortcutsDialog.displayName = 'ShortcutsDialog';

export const ShortcutsDialog = wrap(_ShortcutsDialog);
