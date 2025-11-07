// import { DateService } from "@/services/date-service.js";
// import { IProduct } from "@/common/product/product-types.js";
// import faker from "faker";
// import { ProductRepository } from "@/common/product/product-repository.js";
// import { ProductCategoryArray } from "@/common/product/product-model.js";
// import { DefinedTenantIds } from "@/seed/constants.js";

// export async function seed_product() {
//   try {
//     for (let index = 0; index < 10; index++) {
//       const purchaseDate = faker.date.between(new Date("2019-01-01"), new Date()).toISOString();
//       const p = {
//         tenantId: faker.helpers.randomize(DefinedTenantIds),
//         amount: Number(faker.finance.amount(1000, 12999)),
//         category: faker.helpers.randomize(ProductCategoryArray),
//         purchaseDate: DateService.format_YYYY_MM_DD(purchaseDate),
//         name: faker.commerce.productName(),
//         remark: faker.commerce.productDescription(),
//       } as IProduct;
//       if (index % 5 === 0) {
//         console.log({ insertCount: index });
//       }
//       await ProductRepository.create(p);
//     }
//     console.log("Done");
//   } catch (error) {
//     console.log(error);
//   }
// }
