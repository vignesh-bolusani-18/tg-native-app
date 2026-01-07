import { google } from "googleapis";

const creds = {
  type: "service_account",
  project_id: "test-project-406809",
  private_key_id: "627f4954d42ac990ca87629623feb8e00b009a80",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnMhrVLrv95ZRQ\nmcc+66/9+NBGUU7EXuv+1c8MgSIT7P5jISVhGNA3zI7FyR60Jw6NR80FxHde8dTU\n5hn58NuKpVlAKR1z67n3P4zH77d2HNliKfDoFX1cCgnQtgwo30tRY5Wm+P/Z12l+\nYyLA3H3b4huThP1p0QC9gFQ/ABXNMexBHq06khdo0pigFdgZoYYU4R2HjnUDvg3r\nXcccezqsoV+T7nl5TxbbCL0Nt64VfJCNfgyaUKLC5Ozvg+UsgvP9v93Ao6fPtj3H\nm5cFMAhmg9lwpThu4ykweILYkPMatTfLiZOO91HCE5wjAXUnJZMEaurgBeuJ6wq5\nFsiA5ugjAgMBAAECggEAF/Pwriv02MoENovhZJ1FaGA2DmzlmPJ0YtzkvcjeRfaE\n91SvUzrH0caniaRnlq2lww3PTI06AMsqj5mrjQg5m6JWp/977biOuuJK2/X21aAK\ncKrLjaROgloZz+HU2iIrWyymKvavSNk4jtfLCdBM46yAAOFjoL5FmeCBsUjk1rGd\nyjCewTFdw2vwQXNlfjW2UcZfO4iAzTAlnUNBD9WbFKYKWumKrJs7PvcTSWHEiv96\nsqq1+YlOLMKxxKZSoS67GAjUmwIdNZxFzy4E+DFg54KlZ+ihIZxhnRjGrput2u3z\nxerosje1zLZ7OVlb6vm6p1ugivvi4Fw+m8fTeCYacQKBgQDgebSdIJM4PR14zIjF\nZITi4hp8WrTycEKKZY8t179Vk2x/dyPQF08PiD65S+R7g5FgYoB1HqyEZ2b1cbhs\nXZClO/lQy6KU4GP46jiY28gB0Rdm4iEgl5rXMHHBHfSlmCyDofTKIkoM/vYRXyET\nGUAwKbGTZNcTI9gN5Rfl2R7I+QKBgQC+rRdr20fWLcK2KQMU5kRLhmiyvK9LEjBR\n1Tx/t8cvch4UvK6WyIzHiwC0C9m+UHrVXktBQuScRQ5FYX2CzRwgRl849H5o23xi\nKdFcfwMOqE3Nhy40TM/hZ+0h/pob3ojZI3t3n4tEely4DvpxJobdfoe4bBfdKd4e\nqhpxxmm8+wKBgBCAogiTJn+R7qK81qk8VJChcrUFrhvMqPens7j5DXXrGqTcS2O2\n8vb/Wy0gKTHzYDKnyy3RDXnGaElPDPHahxG+sPuBnPg47uCTx4llTvTjPEcyBKFy\nw81iIFrEKwIph8w9kdNyZeNCszBfv/y5dICV8BoX5b/geLe8yd758UtxAoGBAI77\nTSzb6ip5diES7/SkF2JrD+e4BdrNcN5sgElljj/N2zDBrEn1aVvYqFZa7JUB1Jpb\ncyMk/jkQr3rneC61j/nDy3PyIziOHd+ebBhoReqf2nfcfpFJaDkmrXNocDel0AjD\nyroRMWXQO+bplHN06Hz/fNaWd+6ojp9//wSCPJgxAoGAap6cD/SkD2JhWJGPU8F/\nN7XQdFLZd7QalPaPqn/skzkkD0RYCsx+N/+LyoUL+dNdh8E5H6t/JImvU7B1FUlN\nr6h21fi0qOXExHZDhy5h2SVGaKNAcM0pLPE2lNxn96FonatgzFBAslT5+7V0MWW4\nAhOqOEITgYiUaoe1vb8ovnU=\n-----END PRIVATE KEY-----\n",
  client_email: "service-acc@test-project-406809.iam.gserviceaccount.com",
  client_id: "102226558300759352651",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/service-acc%40test-project-406809.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};
/**
 * Creates and returns an OAuth2 client.
 * @returns {google.auth.OAuth2} - The OAuth2 client.
 */
export const createOAuth2Client = () => {
  const credentialsPath = "./Credentials/test-project-406809-627f4954d42a.json";
  const credentials = creds;
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  return oAuth2Client;
};

/**
 * Creates a service account client.
 * @returns {google.auth.JWT} - The JWT client.
 */
export const createServiceAccountClient = () => {
  const credentialsPath = "./Credentials/test-project-406809-627f4954d42a.json";
  const credentials = creds;

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  return auth;
};
