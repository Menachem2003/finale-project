export default class Logger {
  static colorize(text: string, colorCode: string): string {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  static formatMessage(message: unknown, prefix: string, colorCode: string): string {
    const coloredPrefix = this.colorize(prefix, colorCode);

    if (typeof message === "string") {
      return `${coloredPrefix} ${message}`;
    }

    let objToStringify: Record<string, unknown> = {};

    if (typeof message === "object") {
      objToStringify = { ...(message as Record<string, unknown>) };

      if (message instanceof Error) {
        objToStringify.message = message.message;
        objToStringify.stack = message.stack;
      }
    }

    const formattedMessage = `\n${JSON.stringify(
      objToStringify,
      null,
      2
    ).replace(/\\n/g, "\n")}`;

    return `${coloredPrefix}${formattedMessage}`;
  }

  static info(message: unknown): void {
    console.log(this.formatMessage(message, "[INFO]:", "36")); // Cyan
  }

  static error(message: unknown): void {
    console.log(this.formatMessage(message, "[ERROR]:", "31")); // Red
  }

  static warn(message: unknown): void {
    console.warn(this.formatMessage(message, "[WARN]:", "33")); // Yellow
  }

  static success(message: unknown): void {
    console.log(this.formatMessage(message, "[SUCCESS]:", "32")); // Green
  }

  static debug(message: unknown): void {
    console.log(this.formatMessage(message, "[DEBUG]:", "34")); // Blue
  }
}
