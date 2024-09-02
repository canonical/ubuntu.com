import { copyToClipboardAsync } from "./copyToClipboardAsync";

describe("copyToClipboardAsync", () => {
  let writeTextMock: jest.Mock;
  let execCommandMock: jest.Mock;

  beforeEach(() => {
    if (navigator.clipboard) {
      writeTextMock = jest.fn();
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
      });
    }

    execCommandMock = jest.fn();
    Object.defineProperty(document, "execCommand", {
      value: execCommandMock,
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should use navigator.clipboard.writeText when available", async () => {
    if (navigator.clipboard) {
      writeTextMock.mockResolvedValue(undefined);

      await copyToClipboardAsync("Test text");

      expect(writeTextMock).toHaveBeenCalledWith("Test text");
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    } else {
      console.warn("navigator.clipboard is not available in this environment.");
    }
  });

  it("should fall back to document.execCommand when navigator.clipboard is not available", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
    });

    execCommandMock.mockReturnValueOnce(true);

    await copyToClipboardAsync("Test text");

    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(execCommandMock).toHaveBeenCalledTimes(1);
  });

  it("should reject when navigator.clipboard.writeText fails", async () => {
    if (navigator.clipboard) {
      writeTextMock.mockRejectedValue(new Error("Failed to copy"));

      await expect(copyToClipboardAsync("Test text")).rejects.toThrow(
        "Failed to copy",
      );
    } else {
      console.warn("navigator.clipboard is not available in this environment.");
    }
  });

  it("should reject when document.execCommand fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
    });

    execCommandMock.mockReturnValueOnce(false);

    await expect(copyToClipboardAsync("Test text")).rejects.toThrow(
      "Failed to copy text",
    );
  });

  it("should clean up the textarea element after copying", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
    });

    execCommandMock.mockReturnValueOnce(true);

    const initialTextareaCount =
      document.getElementsByTagName("textarea").length;

    await copyToClipboardAsync("Test text");

    const finalTextareaCount = document.getElementsByTagName("textarea").length;
    expect(finalTextareaCount).toBe(initialTextareaCount);
  });
});
