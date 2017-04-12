/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  ...PropBase.propTypes,
  haveComponent: PropTypes.bool,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSetComponent: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  haveComponent: false,
  disabled: false,
  getLocalizedText: returnArg,
  onSetComponent: noop,
};

export class PropComponent extends PropBase {
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const {
      haveComponent,
      disabled,
      getLocalizedText,
      onSetComponent,
    } = this.props;
    
    //noinspection JSCheckFunctionSignatures
    const text = haveComponent
      ? getLocalizedText('props.component.editComponent')
      : getLocalizedText('props.component.setComponent');
    
    //noinspection JSValidateTypes
    return (
      <Button
        kind="link"
        text={text}
        disabled={disabled}
        onPress={onSetComponent}
      />
    );
  }
}

PropComponent.propTypes = propTypes;
PropComponent.defaultProps = defaultProps;
PropComponent.displayName = 'PropComponent';
