import "../editor.scss";

import { ChainedCommands, Editor } from "@tiptap/core";
import {
    EditorContent,
    EditorContext,
    useEditor,
    useEditorState,
} from "@tiptap/react";
import { faAlignCenter } from "@fortawesome/free-solid-svg-icons/faAlignCenter";
import { faBold } from "@fortawesome/free-solid-svg-icons/faBold";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faHeading } from "@fortawesome/free-solid-svg-icons/faHeading";
import { faItalic } from "@fortawesome/free-solid-svg-icons/faItalic";
import { faList } from "@fortawesome/free-solid-svg-icons/faList";
import { faHighlighter, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { faSubscript } from "@fortawesome/free-solid-svg-icons/faSubscript";
import { faSuperscript } from "@fortawesome/free-solid-svg-icons/faSuperscript";
import { faTable } from "@fortawesome/free-solid-svg-icons/faTable";
import { faTerminal } from "@fortawesome/free-solid-svg-icons/faTerminal";
import { faTextSlash } from "@fortawesome/free-solid-svg-icons/faTextSlash";
import { faUnderline } from "@fortawesome/free-solid-svg-icons/faUnderline";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
    Menu,
    SubMenu,
    MenuButton,
    MenuItem,
    MenuDivider,
} from "@szhsin/react-menu";
import { useEffect, useMemo } from "react";
import * as Y from "yjs";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import EXTENSIONS from "../../../tiptap_gw";
import LinkButton from "./link";
import HeadingIdButton from "./heading";
import ColorButton from "./color";
import { TableCaptionBookmarkButton, TableCellBackgroundColor } from "./table";
import CaptionButton from "./caption";
import FootnoteButton from "./footnote";
import PassiveVoiceButton from "./passive_voice";
import { t } from "../../i18n";

// For debugging
//(window as any).tiptapSchema = getSchema(EXTENSIONS);

function FormatButton(props: {
    editor: Editor;
    chain: (ch: ChainedCommands) => ChainedCommands;
    tooltip?: string;
    active?: boolean | string | {} | ((e: Editor) => boolean);
    enable?: boolean | null | ((e: Editor) => boolean);
    menuItem?: boolean;
    children: React.ReactNode;
}) {
    const editor = props.editor;
    const { enabled, active } = useEditorState({
        editor,
        selector: ({ editor }) => {
            if (!editor.isInitialized) return { enabled: false, active: false };

            let enabled = false;
            if (typeof props.enable === "function")
                enabled = props.enable(editor);
            else if (typeof props.enable === "boolean") enabled = props.enable;
            else enabled = props.chain(editor.can().chain().focus()).run();

            let active = false;
            if (props.active === undefined) active = false;
            else if (typeof props.active === "function")
                active = props.active(editor);
            else if (typeof props.active === "boolean") active = props.active;
            else active = editor.isActive(props.active);

            return { enabled, active };
        },
    });

    if (props.menuItem === true) {
        return (
            <MenuItem
                onClick={() => {
                    props.chain(editor.chain().focus()).run();
                }}
                disabled={!enabled}
                className={active ? "is-active" : undefined}
                title={props.tooltip}
            >
                {props.children}
            </MenuItem>
        );
    }
    return (
        <button
            type="button"
            onClick={(ev) => {
                ev.preventDefault();
                props.chain(editor.chain().focus()).run();
            }}
            disabled={!enabled}
            className={active ? "is-active" : undefined}
            tabIndex={-1}
            title={props.tooltip}
        >
            {props.children}
        </button>
    );
}

export function Toolbar(props: {
    editor: Editor | null;
    extra?: (editor: Editor) => React.ReactNode;
}) {
    const editor = props.editor;
    if (!editor || editor.isDestroyed) return null;
    return (
        <div className="control-group">
            <div className="button-group">
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleBold()}
                    active="bold"
                    tooltip={t("editor.bold", "Bold")}
                >
                    <FontAwesomeIcon icon={faBold} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleItalic()}
                    active="italic"
                    tooltip={t("editor.italic", "Italic")}
                >
                    <FontAwesomeIcon icon={faItalic} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleUnderline()}
                    active="underline"
                    tooltip={t("editor.underline", "Underline")}
                >
                    <FontAwesomeIcon icon={faUnderline} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleCode()}
                    active="code"
                    tooltip={t("editor.codeSegment", "Code Segment")}
                >
                    <FontAwesomeIcon icon={faCode} />
                </FormatButton>
                <LinkButton editor={editor} />
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleSubscript()}
                    active="sub"
                    tooltip={t("editor.subscript", "Subscript")}
                >
                    <FontAwesomeIcon icon={faSubscript} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleSuperscript()}
                    active="sup"
                    tooltip={t("editor.superscript", "Superscript")}
                >
                    <FontAwesomeIcon icon={faSuperscript} />
                </FormatButton>
                <ColorButton editor={editor} />
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleHighlight()}
                    active="highlight"
                    tooltip={t("editor.highlight", "Highlight")}
                >
                    <FontAwesomeIcon icon={faHighlighter} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.unsetAllMarks()}
                    tooltip={t("editor.clearFormatting", "Clear Formatting")}
                >
                    <FontAwesomeIcon icon={faTextSlash} />
                </FormatButton>
            </div>
            <div className="separator" />
            <div className="button-group">
                <Menu
                    portal
                    menuClassName="collab-edit-toolbar-menu"
                    menuButton={
                        <MenuButton
                            tabIndex={-1}
                            title={t("editor.heading", "Heading")}
                        >
                            <FontAwesomeIcon icon={faHeading} />
                            <FontAwesomeIcon icon={faChevronDown} />
                        </MenuButton>
                    }
                >
                    {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                        <FormatButton
                            key={level}
                            menuItem
                            editor={editor}
                            chain={(c) => c.toggleHeading({ level })}
                            active={(e) => e.isActive("heading", { level })}
                        >
                            {t("editor.headingLevel", "Heading {level}", {
                                level,
                            })}
                        </FormatButton>
                    ))}

                    <HeadingIdButton editor={editor} />
                </Menu>
                <Menu
                    portal
                    menuClassName="collab-edit-toolbar-menu"
                    menuButton={
                        <MenuButton
                            tabIndex={-1}
                            title={t("editor.justification", "Justification")}
                        >
                            <FontAwesomeIcon icon={faAlignCenter} />
                            <FontAwesomeIcon icon={faChevronDown} />
                        </MenuButton>
                    }
                >
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.setTextAlign("left")}
                        active={{ textAlign: "left" }}
                        enable
                    >
                        {t("editor.left", "Left")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.setTextAlign("center")}
                        active={{ textAlign: "center" }}
                        enable
                    >
                        {t("editor.center", "Center")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.setTextAlign("right")}
                        active={{ textAlign: "right" }}
                        enable
                    >
                        {t("editor.right", "Right")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.setTextAlign("justify")}
                        active={{ textAlign: "justify" }}
                        enable
                    >
                        {t("editor.justify", "Justify")}
                    </FormatButton>
                </Menu>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleCodeBlock()}
                    active="codeBlock"
                    tooltip={t("editor.codeBlock", "Code Block")}
                >
                    <FontAwesomeIcon icon={faTerminal} />
                </FormatButton>
                <FormatButton
                    editor={editor}
                    chain={(c) => c.toggleBlockquote()}
                    active="blockquote"
                    tooltip={t("editor.blockquote", "Blockquote")}
                >
                    <FontAwesomeIcon icon={faQuoteLeft} />
                </FormatButton>
            </div>
            <div className="separator" />
            <div className="button-group">
                <Menu
                    portal
                    menuClassName="collab-edit-toolbar-menu"
                    menuButton={
                        <MenuButton tabIndex={-1} title={t("editor.list", "List")}>
                            <FontAwesomeIcon icon={faList} />
                            <FontAwesomeIcon icon={faChevronDown} />
                        </MenuButton>
                    }
                >
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.toggleBulletList()}
                        active="bulletList"
                    >
                        {t("editor.bullet", "Bullet")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.toggleOrderedList()}
                        active="orderedList"
                    >
                        {t("editor.ordered", "Ordered")}
                    </FormatButton>
                </Menu>
                <Menu
                    portal
                    menuClassName="collab-edit-toolbar-menu"
                    menuButton={
                        <MenuButton tabIndex={-1} title={t("editor.table", "Table")}>
                            <FontAwesomeIcon icon={faTable} />
                            <FontAwesomeIcon icon={faChevronDown} />
                        </MenuButton>
                    }
                >
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) =>
                            c.insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                        }
                    >
                        {t("editor.tableInsert", "Insert")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.deleteTable()}
                    >
                        {t("editor.tableDelete", "Delete")}
                    </FormatButton>
                    <SubMenu
                        label={
                            <span>
                                {t("editor.columns", "Columns")}
                                <FontAwesomeIcon icon={faChevronRight} />
                            </span>
                        }
                    >
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.toggleHeaderColumn()}
                        >
                            {t(
                                "editor.toggleHeaderColumn",
                                "Toggle header column"
                            )}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.addColumnBefore()}
                        >
                            {t("editor.addColumnBefore", "Add column before")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.addColumnAfter()}
                        >
                            {t("editor.addColumnAfter", "Add column after")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.deleteColumn()}
                        >
                            {t("editor.deleteColumn", "Delete column")}
                        </FormatButton>
                    </SubMenu>
                    <SubMenu
                        label={
                            <span>
                                {t("editor.rows", "Rows")}
                                <FontAwesomeIcon icon={faChevronRight} />
                            </span>
                        }
                    >
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.toggleHeaderRow()}
                        >
                            {t("editor.toggleHeaderRow", "Toggle header row")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.addRowBefore()}
                        >
                            {t("editor.addRowBefore", "Add row before")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.addRowAfter()}
                        >
                            {t("editor.addRowAfter", "Add row after")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.deleteRow()}
                        >
                            {t("editor.deleteRow", "Delete row")}
                        </FormatButton>
                    </SubMenu>
                    <SubMenu
                        label={
                            <span>
                                {t("editor.cells", "Cells")}
                                <FontAwesomeIcon icon={faChevronRight} />
                            </span>
                        }
                    >
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.mergeCells()}
                        >
                            {t("editor.mergeCells", "Merge cells")}
                        </FormatButton>
                        <FormatButton
                            menuItem
                            editor={editor}
                            chain={(c) => c.splitCell()}
                        >
                            {t("editor.splitCell", "Split cell")}
                        </FormatButton>
                        <TableCellBackgroundColor editor={editor} />
                    </SubMenu>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.addCaption()}
                    >
                        {t("editor.addCaption", "Add Caption")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.removeCaption()}
                    >
                        {t("editor.removeCaption", "Remove Caption")}
                    </FormatButton>
                    <TableCaptionBookmarkButton editor={editor} />
                </Menu>
                <FormatButton editor={editor} chain={(c) => c.setPageBreak()}>
                    {t("editor.pageBreak", "Page Break")}
                </FormatButton>
                <Menu
                    portal
                    menuClassName="collab-edit-toolbar-menu"
                    menuButton={
                        <MenuButton tabIndex={-1} title={t("editor.misc", "Misc")}>
                            <FontAwesomeIcon icon={faBars} />
                        </MenuButton>
                    }
                >
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.changeCase("lower")}
                    >
                        {t("editor.lowercaseText", "Lowercase Text")}
                    </FormatButton>
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.changeCase("upper")}
                    >
                        {t("editor.uppercaseText", "Uppercase Text")}
                    </FormatButton>
                    <MenuDivider />
                    <CaptionButton editor={editor} />
                    <FootnoteButton editor={editor} />
                    <PassiveVoiceButton editor={editor} />
                    <FormatButton
                        menuItem
                        editor={editor}
                        chain={(c) => c.insertGwImage("CLIENT_LOGO")}
                    >
                        {t("editor.insertClientLogo", "Insert Client Logo")}
                    </FormatButton>
                </Menu>
            </div>
            {props.extra && <div className="separator" />}
            {props.extra && props.extra(editor)}
        </div>
    );
}

export default function RichTextEditor(props: {
    connected: boolean;
    provider: HocuspocusProvider;
    fragment: Y.XmlFragment;
    toolbarExtra?: (editor: Editor) => React.ReactNode;
}) {
    const extensions = useMemo(
        () =>
            EXTENSIONS.concat(
                Collaboration.configure({
                    document: props.provider.document,
                    fragment: props.fragment,
                }),
                CollaborationCaret.configure({
                    provider: props.provider,
                    user: props.provider.awareness!.getLocalState()!.user,
                })
            ),
        [props.provider, props.fragment]
    );
    const editor = useEditor({
        extensions,
    });

    useEffect(() => {
        editor?.setEditable(props.connected);
    }, [editor, props.connected]);

    return (
        <div
            className={
                "collab-editor " +
                (props.connected ? "" : "collab-editor-disabled")
            }
        >
            <EditorContext.Provider value={{ editor }}>
                <Toolbar editor={editor} extra={props.toolbarExtra} />
                <EditorContent editor={editor} />
            </EditorContext.Provider>
        </div>
    );
}
