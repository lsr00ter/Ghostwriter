import { zhHansMessages } from "./messages";

type TemplateValues = Record<string, number | string>;

function normalizeLanguage(language: string | null | undefined): "en" | "zh-hans" {
    const value = (language ?? "").toLowerCase();
    return value.startsWith("zh") ? "zh-hans" : "en";
}

export function getUiLanguage(): "en" | "zh-hans" {
    return normalizeLanguage(document.documentElement.lang);
}

function formatMessage(message: string, values?: TemplateValues): string {
    if (!values) return message;

    return Object.entries(values).reduce(
        (result, [key, value]) =>
            result.split(`{${key}}`).join(String(value)),
        message
    );
}

export function t(
    key: string,
    fallback: string,
    values?: TemplateValues
): string {
    const message =
        getUiLanguage() === "zh-hans"
            ? zhHansMessages[key] ?? fallback
            : fallback;

    return formatMessage(message, values);
}