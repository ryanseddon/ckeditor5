/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class JSONData extends Plugin {
	static get pluginName() {
		return "JSONData";
	}

	init() {
		console.log("JSONData.init()");

		this._initDataPipeline();
	}

	_initDataPipeline() {
		const editor = this.editor;

		editor.data.init = function(allRootsData) {
			const parsedData = JSON.parse(allRootsData.trim());

			editor.model.enqueueChange("transparent", writer => {
				const root = editor.model.document.getRoot(parsedData.root);

				createChildren(writer, root, parsedData.children);
			});
		};

		const _stringify = editor.data.stringify;

		editor.data.stringify = function(modelElementOrFragment) {
			let data;

			if (modelElementOrFragment.is("rootElement")) {
				data = {
					root: modelElementOrFragment.toJSON(),
					children: Array.from(
						modelElementOrFragment.getChildren()
					).map(child => child.toJSON())
				};
			} else {
				data = modelElementOrFragment.toJSON();
			}

			return {
				json: JSON.stringify(data),
				html: _stringify.call(this, modelElementOrFragment)
			};
		};
	}
}

function createChildren(writer, parent, children = []) {
	for (const child of children) {
		if (!child.name) {
			writer.appendText(child.data, child.attributes, parent);
		} else {
			const childElement = writer.createElement(
				child.name,
				child.attributes
			);

			writer.append(childElement, parent);

			createChildren(writer, childElement, child.children);
		}
	}
}
