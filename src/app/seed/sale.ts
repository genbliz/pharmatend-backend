// import { DateService } from "../services/date-service.js";
// import faker from "faker";
// import { ISale } from "@/common/sale/sale-types.js";
// import { SaleRepository } from "@/common/sale/sale-repository.js";
// import { DefinedTenantIds } from "./constants.js";

// export async function seed_sale() {
//   try {
//     for (let index = 0; index < 10; index++) {
//       const saleDate = faker.date.between(new Date("2019-01-01"), new Date()).toISOString();
//       const p = {
//         tenantId: faker.helpers.randomize(DefinedTenantIds),
//         title: faker.commerce.productName(),
//         amount: Number(faker.finance.amount(9999, 12999)),
//         customerId: faker.random.uuid(),
//         productId: faker.random.uuid(),
//         saleDate: DateService.format_YYYY_MM_DD(saleDate),
//         remark: faker.commerce.productDescription(),
//       } as ISale;
//       if (index % 5 === 0) {
//         console.log({ insertCount: index });
//       }
//       await SaleRepository.create(p);
//     }
//     console.log("Done");
//   } catch (error) {
//     console.log(error);
//   }
// }
