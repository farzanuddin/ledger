import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Entry } from "../types";
import { buildLedgerReportHtml } from "../utils/report";

type ShareLedgerPdfParams = {
  balanceCents: number;
  entries: Entry[];
  user: string;
};

export const useLedgerSharing = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareLedgerPdf = useCallback(
    async ({ balanceCents, entries, user }: ShareLedgerPdfParams) => {
      if (Platform.OS === "web") {
        Alert.alert(
          "Share from your phone",
          "PDF sharing is available in Expo Go on Android.",
        );
        return;
      }

      setIsSharing(true);

      try {
        const html = buildLedgerReportHtml({ balanceCents, entries, user });
        const { uri } = await Print.printToFileAsync({
          base64: false,
          html,
        });
        const sharingAvailable = await Sharing.isAvailableAsync();

        if (!sharingAvailable) {
          Alert.alert("Sharing unavailable", "This device cannot share files.");
          return;
        }

        await Sharing.shareAsync(uri, {
          dialogTitle: "Share ledger PDF",
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      } catch (error) {
        Alert.alert("Could not share PDF", String(error));
      } finally {
        setIsSharing(false);
      }
    },
    [],
  );

  return useMemo(() => ({ isSharing, shareLedgerPdf }), [isSharing, shareLedgerPdf]);
};
