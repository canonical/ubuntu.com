import { getUserInfo } from "advantage/api/contracts";
import { UserInfo } from "advantage/api/types";
import { useQuery, UseQueryOptions } from "react-query";

export const useUserInfo = <D = UserInfo>(
  options?: UseQueryOptions<UserInfo, unknown, D>
) => {
  const query = useQuery("userInfo", async () => await getUserInfo(), options);
  return query;
};
