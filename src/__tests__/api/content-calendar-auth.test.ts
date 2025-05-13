import { GET, POST } from "@/app/api/content-calendar/route";

describe("Content Calendar API Auth", () => {
  test("GET allows viewer", async () => {
    const req = {} as any; // mock
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  test("POST disallows non-authorized user", async () => {
    // override getUserSession to return no-permission user
    const req = {} as any;
    jest.spyOn(global, "getUserSession" as any).mockImplementation(() => ({ userId: 'x', role: 'viewer' }));
    await expect(POST(req)).rejects.toThrow(/Unauthorized/);
  });
});