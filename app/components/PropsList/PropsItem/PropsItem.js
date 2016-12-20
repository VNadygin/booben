'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import {
    Button,
    Input,
    Checkbox,
    Icon,
    SelectBox,
    Tag,
    Textarea,
    ToggleButton
} from '@reactackle/reactackle';

import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropTreeList } from './PropTreeList/PropTreeList';
import { PropTreeBreadcrumbs } from './PropTreeBreadcrumbs/PropTreeBreadcrumbs';

import { noop } from '../../../utils/misc';

/**
 * @typedef {Object} PropsItemPropTypeOption
 * @property {*} value
 * @property {string} text
 * @property {boolean} disabled
 */

/**
 * @typedef {Object} PropsItemPropType
 * @property {string} label
 * @property {string} type
 * @property {string} view
 * @property {string} image
 * @property {string} tooltip
 * @property {boolean} linkable
 * @property {PropsItemPropTypeOption[]} [options]
 * @property {Object<string, PropsItemPropType>} [fields]
 * @property {PropsItemPropType} [ofType]
 * @property {Function} [transformValue]
 * @property {Function} [formatItemLabel]
 */

/**
 * @typedef {Object} PropsItemValue
 * @property {*} value
 * @property {boolean} linked
 */

/**
 *
 * @param {PropsItemPropType} baseType
 * @param {string|number} index
 * @returns {PropsItemPropType}
 */
const getNestedType = (baseType, index) => {
    if (baseType.view === 'shape') {
        if (typeof index !== 'string') throw new Error('Shit happened');
        return baseType.fields[index];
    }
    else if (baseType.view === 'array') {
        if (typeof index !== 'number') throw new Error('Shit happened');
        return baseType.ofType;
    }
    else if (baseType.view === 'object') {
        if (typeof index !== 'string') throw new Error('Shit happened');
        return baseType.ofType;
    }
    else {
        throw new Error('Shit happened')
    }
};

/**
 *
 * @param {PropsItemPropType} propType
 * @param {(string|number)[]} path
 * @return {PropsItemPropType}
 */
const getTypeByPath = (propType, path) => path.reduce(getNestedType, propType);

/**
 *
 * @param {PropsItemValue} value
 * @param {string|number} index
 * @return {*}
 */
export const getNestedValue = (value, index) => value.value ? value.value[index]: void 0;

/**
 *
 * @param {PropsItemValue} value
 * @param {(string|number)[]} path
 * @return {*}
 */
export const getValueByPath = (value, path) => path.reduce(getNestedValue, value);

export class PropsItem extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            currentPath: []
        };

        this._handleOpen = this._handleOpen.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this._handleSetComponent = this._handleSetComponent.bind(this);
		this._handleValueNullSwitch = this._handleValueNullSwitch.bind(this);
        this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
        this._handleBreadcrumbsItemSelect = this._handleBreadcrumbsItemSelect.bind(this);
    }

    /**
     *
     * @private
     */
    _handleOpen() {
        if (this.props._secondary) {
            this.props._onOpen();
        }
        else {
            this.setState({
                isOpen: !this.state.isOpen,
                currentPath: []
            });
        }
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleOpenNestedValue(index) {
        this.setState({
            currentPath: [...this.state.currentPath, index]
        });
    }

    /**
     *
     * @param {number} index
     * @private
     */
    _handleBreadcrumbsItemSelect(index) {
        this.setState({
            currentPath: this.state.currentPath.slice(0, index)
        });
    }

    /**
     *
     * @private
     */
	_handleValueNullSwitch() {
		this.props.onNullSwitch([]);
	}

    /**
     *
     * @param {number} index
     * @private
     */
	_handleNestedValueNullSwitch(index) {
		this.props.onNullSwitch([...this.state.currentPath, index]);
	}

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleNestedValueLink(index) {
        this.props.onLink([...this.state.currentPath, index]);
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleDelete(index) {
        this.props.onDeleteValue(this.state.currentPath, index);
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleAddValue(index) {
        this.props.onAddValue(this.state.currentPath, index);
    }

    /**
     *
     * @param {string} [name]
     * @private
     */
    _handleAddButtonPress(name) {
        const currentType = getTypeByPath(
            this.props.propType,
            this.state.currentPath
        );

        if (currentType.view === 'array') {
            this._handleAddValue(-1);
        }
        else if (currentType.view === 'object') {
            this._handleAddValue(name);
        }
    }

    /**
     *
     * @param {string|number} index
     * @param {*} newValue
     * @private
     */
    _handleNestedValueChange(index, newValue) {
        const currentType = getTypeByPath(
            this.props.propType,
            [].concat(this.state.currentPath, index)
        );

        if (typeof currentType.transformValue === 'function')
            newValue = currentType.transformValue(newValue);

        this.props.onChange(newValue, [...this.state.currentPath, index]);
    }

    _handleNestedSetComponent(index) {
        this.props.onSetComponent([...this.state.currentPath, index]);
    }

    _handleChange(newValue) {
        if (typeof this.props.propType.transformValue === 'function')
            newValue = this.props.propType.transformValue(newValue);

        this.props.onChange(newValue, []);
    }

    _handleSetComponent() {
        this.props.onSetComponent([]);
    }

    _renderBreadcrumbs() {
        if (this.state.currentPath.length === 0) return null;

        const items = [{
            title: this.props.propType.label,
            subtitle: this.props.propType.type
        }];

        let currentType = this.props.propType;

        for (let i = 0, l = this.state.currentPath.length; i < l; i++) {
            const pathElement = this.state.currentPath[i],
                nestedType = getNestedType(currentType, pathElement);

            items.push({
                title: currentType.view === 'shape'
                    ? nestedType.label
                    : currentType.formatItemLabel
						&&	currentType.formatItemLabel(pathElement),

                subtitle: nestedType.type
            });

            currentType = nestedType;
        }

        return (
            <PropTreeBreadcrumbs
                items={items}
                onItemSelect={this._handleBreadcrumbsItemSelect}
            />
        );
    }

    _renderNestedItems() {
        const breadcrumbs = this._renderBreadcrumbs();

        const currentType = getTypeByPath(
            this.props.propType,
            this.state.currentPath
        );

        const currentValue = getValueByPath(
            this.props.value,
            this.state.currentPath
        );

		if (!currentValue || currentValue.value === null) return null;

        let childItems = null;
        if (currentType.view === 'shape') {
            childItems = Object.keys(currentType.fields).map((fieldName, idx) => (
                <PropsItem
                    key={idx}
                    propType={currentType.fields[fieldName]}
                    value={currentValue.value[fieldName]}
                    setComponentButtonText={this.props.setComponentButtonText}
                    editComponentButtonText={this.props.editComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    addDialogTitleText={this.props.addDialogTitleText}
                    addDialogInputLabelText={this.props.addDialogInputLabelText}
                    addDialogSaveButtonText={this.props.addDialogSaveButtonText}
                    addDialogCancelButtonText={this.props.addDialogCancelButtonText}
                    onChange={this._handleNestedValueChange.bind(this, fieldName)}
                    onSetComponent={this._handleNestedSetComponent.bind(this, fieldName)}
                    onLink={this._handleNestedValueLink.bind(this, fieldName)}
					onNullSwitch={this._handleNestedValueNullSwitch.bind(this, fieldName)}
                    _secondary
                    _onOpen={this._handleOpenNestedValue.bind(this, fieldName)}
                />
            ));
        }
        else if (currentType.view === 'array') {
            childItems = currentValue.value.map((itemValue, idx) => (
                <PropsItem
                    key={idx}
                    propType={currentType.ofType}
                    value={itemValue}
                    setComponentButtonText={this.props.setComponentButtonText}
                    editComponentButtonText={this.props.editComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    addDialogTitleText={this.props.addDialogTitleText}
                    addDialogInputLabelText={this.props.addDialogInputLabelText}
                    addDialogSaveButtonText={this.props.addDialogSaveButtonText}
                    addDialogCancelButtonText={this.props.addDialogCancelButtonText}
                    onChange={this._handleNestedValueChange.bind(this, idx)}
                    onSetComponent={this._handleNestedSetComponent.bind(this, idx)}
                    onLink={this._handleNestedValueLink.bind(this, idx)}
					onNullSwitch={this._handleNestedValueNullSwitch.bind(this, idx)}
                    _secondary
					_label={
						currentType.formatItemLabel
							?	currentType.formatItemLabel(idx)
							:	''
					}
                    _deletable
                    _onOpen={this._handleOpenNestedValue.bind(this, idx)}
                    _onDelete={this._handleDelete.bind(this, idx)}
                />
            ));
        }
        else if (currentType.view === 'object') {
            childItems = Object.keys(currentValue.value).map(key => (
                <PropsItem
                    key={key}
                    propType={currentType.ofType}
                    value={currentValue[key]}
                    setComponentButtonText={this.props.setComponentButtonText}
                    editComponentButtonText={this.props.editComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    addDialogTitleText={this.props.addDialogTitleText}
                    addDialogInputLabelText={this.props.addDialogInputLabelText}
                    addDialogSaveButtonText={this.props.addDialogSaveButtonText}
                    addDialogCancelButtonText={this.props.addDialogCancelButtonText}
                    onChange={this._handleNestedValueChange.bind(this, key)}
                    onSetComponent={this._handleNestedSetComponent.bind(this, key)}
                    onLink={this._handleNestedValueLink.bind(this, key)}
					onNullSwitch={this._handleNestedValueNullSwitch.bind(this, key)}
                    _secondary
                    _label={currentType.formatItemLabel(key)}
                    _deletable
                    _onOpen={this._handleOpenNestedValue.bind(this, key)}
                    _onDelete={this._handleDelete.bind(this, key)}
                />
            ));
        }

        const canAddValues =
            currentType.view === 'array' ||
            currentType.view === 'object';

        const needNameOnAdd = currentType.view === 'object';

        return (
            <PropTreeList
                addButton={canAddValues}
                askNameOnAdd={needNameOnAdd}
                addButtonText={this.props.addButtonText}
                addDialogTitleText={this.props.addDialogTitleText}
                addDialogSaveButtonText={this.props.addDialogSaveButtonText}
                addDialogCancelButtonText={this.props.addDialogCancelButtonText}
                addDialogInputLabelText={this.props.addDialogInputLabelText}
                onAdd={this._handleAddButtonPress}
            >
                {breadcrumbs}
                {childItems}
            </PropTreeList>
        );
    }

    render() {
        let className = 'prop-item',
            wrapperClassName = 'prop-item-wrapper';

		const message = this.props.value && this.props.value.message;

        let requireMark = null;
        if (this.props.propType.itemRequired) {
            wrapperClassName += ` is-required`;

            const markIcon = this.props.propType.requirementFullfilled
                ? <Icon name="check" />
                : <Icon name="exclamation" />;

            requireMark = (
                <div className="prop-item_require-mark">
                    <div className="require-mark">
                        {markIcon}
                    </div>
                </div>
            )
        }

        if (this.props.propType.requirementFullfilled)
            className += ` requirement-is-fullfilled`;

        if (this.props.propType.view)
            className += ` prop-type-${this.props.propType.view}`;

        if (this.props.propType.view === 'array' || this.props.propType.view === 'object')
            className += ' is-flat-array';

        if (this.state.isOpen) {
            wrapperClassName += ' sublevel-is-visible';
            className += ' sublevel-is-visible';
        }

        let label = null;
        const labelText = this.props._label || this.props.propType.label;
        if (labelText) {
            label = (
                <div className="prop-item_label-box">
                    {requireMark}

                    <PropLabel
                        label={labelText}
                        type={this.props.propType.type}
                        tooltip={this.props.propType.tooltip}
                    />
                </div>
            );
        }

        let image = null;
        if (this.props.propType.image) {
            image = (
                <PropImage src={this.props.propType.image} />
            );

            wrapperClassName += ' has-image';
        }

        let actionsLeft = null;
        if (this.props._deletable) {
            actionsLeft = (
                <div className="prop_actions prop_actions-left">
                    <div className="prop_action prop_action-collapse">
                        <Button icon="times" onPress={this.props._onDelete} />
                    </div>
                </div>
            );
        }

        let linkAction = null;
        if (this.props.propType.linkable) {
            linkAction = (
                <div className="prop_action prop_action-linking">
                    <Button icon="link" onPress={() => void this.props.onLink([])}/>
                </div>
            );
        }

        let content = null,
            valueWrapper = null,
            toggle = null,
            collapseAction = null,
            subcomponentLeft = null,
            children = null;

        if (!this.props.value.isLinked) {
            const disabled = this.props.value.value === null || this.props.disabled;

            if (this.props.propType.view === 'input') {
                const text = this.props.value.value !== null
                    ? this.props.value.value
                    : '';

                content = (
                    <Input
                        value={text}
                        disabled={disabled}
                        onChange={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'textarea') {
                const text = this.props.value.value !== null
                    ? this.props.value.value
                    : '';

                content = (
                    <Textarea
                        stateless={true}
                        value={text}
                        disabled={disabled}
                        onChange={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'list') {
                content = (
                    <SelectBox
                        stateless={true}
                        data={this.props.propType.options}
                        value={this.props.value.value}
                        disabled={disabled}
                        onSelect={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'constructor') {
                const text = this.props.value.value
                    ? this.props.editComponentButtonText
                    : this.props.setComponentButtonText;

                content = (
                    <Button
                        kind="link"
                        text={text}
                        disabled={disabled}
                        onPress={this._handleSetComponent}
                    />
                );
            }
            else if (this.props.propType.view === 'toggle') {
                const checked = !!this.props.value.value;

                toggle = (
                    <div className="prop_action prop_action-toggle">
                        <ToggleButton
                            checked={checked}
                            disabled={disabled}
                            onCheck={this._handleChange}
                        />
                    </div>
                );
            }
            else {
                const isComplexValue =
                    this.props.propType.view === 'shape' ||
                    this.props.propType.view === 'object' ||
                    this.props.propType.view === 'array';

                if (isComplexValue) {
                    collapseAction = (
                        <div className="prop_action prop_action-collapse">
                            <Button
                                icon="chevron-right"
                                disabled={this.props.disabled}
                                onPress={this._handleOpen}
                            />
                        </div>
                    );

                    className += ' has-sublevel';
                }

                if (!this.props._secondary && this.state.isOpen)
                    children = this._renderNestedItems();
            }
        }
        else {
            if (this.props.value.value) {
                valueWrapper = (
                    <Tag
                        text={this.props.value.value}
                        bounded
                        removable
                    />
                );
            }
        }

        const isNullable = this.props.propType.notNull === false;

        if (isNullable) {
            subcomponentLeft = (
                <div className="prop_subcomponent prop_subcomponent-left">
                    <Checkbox
                        checked={this.props.value.value !== null}
                        onCheck={this._handleValueNullSwitch}
                    />
                </div>
            );
        }

        let actionsRight = null;
        if (toggle || linkAction || collapseAction) {
            actionsRight = (
                <div className="prop_actions prop_actions-right">
                    {toggle}
                    {collapseAction}
                    {linkAction}
                </div>
            );

            wrapperClassName += ' has-actions-right';
        }

        return (
            <div className={className}>
                <div className={wrapperClassName}>
                    {subcomponentLeft}
                    {actionsLeft}
                    {image}

                    <div className="prop-item-content-box">
                        {label}
                        <div className="prop-item_value-wrapper">
                            {valueWrapper}

                            <div className="prop-item_message-wrapper">
                                {message}
                            </div>
                        </div>

                        <div className="prop-item_value-wrapper">
                            {content}
                        </div>
                    </div>

                    {actionsRight}
                </div>

                {children}
            </div>
        );
    }
}

const ValueType = PropTypes.shape({
    value: PropTypes.any,
    isLinked: PropTypes.bool,
	message: PropTypes.string,
});

const propItemTypeShape = {
    label: PropTypes.string,
    type: PropTypes.string,
    view: PropTypes.oneOf([
        'input',
        'textarea',
        'toggle',
        'list',
        'constructor',
        'object',
        'shape',
        'array',
        'empty'
    ]),
    image: PropTypes.string,
    tooltip: PropTypes.string,
    linkable: PropTypes.bool,
    itemRequired: PropTypes.bool,
    requirementFullfilled: PropTypes.bool,
    transformValue: PropTypes.func,

    // For 'object' and 'array' views
    formatItemLabel: PropTypes.func,

    // For 'object' and 'shape' views
    notNull: PropTypes.bool,

    // Options for 'list' view
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        text: PropTypes.string,
        disabled: PropTypes.bool
    }))
};

// Fields for 'shape' view
propItemTypeShape.fields = PropTypes.objectOf(PropTypes.shape(propItemTypeShape));

// Type for 'array' and 'object' views
propItemTypeShape.ofType = PropTypes.shape(propItemTypeShape);

const PropItemType = PropTypes.shape(propItemTypeShape);

PropsItem.propTypes = {
    propType: PropItemType.isRequired,
    value: ValueType.isRequired,
    disabled: PropTypes.bool,
    setComponentButtonText: PropTypes.string,
    editComponentButtonText: PropTypes.string,
    addButtonText: PropTypes.string,
    addDialogTitleText: PropTypes.string,
    addDialogInputLabelText: PropTypes.string,
    addDialogSaveButtonText: PropTypes.string,
    addDialogCancelButtonText: PropTypes.string,

    onChange: PropTypes.func,
    onSetComponent: PropTypes.func,
    onAddValue: PropTypes.func,
    onDeleteValue: PropTypes.func,
    onLink: PropTypes.func,
	onNullSwitch: PropTypes.func,
    onLinkNested: PropTypes.func,

    _secondary: PropTypes.bool,
    _deletable: PropTypes.bool,
    _label: PropTypes.string,
    _onOpen: PropTypes.func,
    _onDelete: PropTypes.func
};

PropsItem.defaultProps = {
    disabled: false,
    setComponentButtonText: '',
    editComponentButtonText: '',
    addButtonText: '',
    addDialogTitleText: '',
    addDialogInputLabelText: '',
    addDialogSaveButtonText: '',
    addDialogCancelButtonText: '',

    onChange: noop,
    onSetComponent: noop,
    onAddValue: noop,
    onDeleteValue: noop,
    onLink: noop,
	onNullSwitch: noop,
    onLinkNested: noop,

    _secondary: false,
    _deletable: false,
    _label: '',
    _onOpen: noop,
    _onDelete: noop
};

PropsItem.displayName = 'PropsItem';
