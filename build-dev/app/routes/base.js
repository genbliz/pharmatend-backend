import { LoggingService } from "../services/logging-service.js";
import { Router } from "express";
import { StaffRepository } from "../common/staff/staff-repository.js";
import { StatusCode } from "../helper/status-code.js";
import { BaseController } from "../core/base-controller.js";
import { envConfig } from "../config/env.js";
import countriesJson from "../../assets/countries.json";
const router = Router();
router.get("/health", (req, res) => {
    res.json({
        data: {
            status: "Working",
            uptime: Math.floor(process.uptime()),
        },
    });
});
router.get("/health/db", (req, res) => {
    StaffRepository.getTest()
        .then((result) => {
        res.json({ data: result, sucess: true });
    })
        .catch((err) => {
        LoggingService.anyError(err);
        res.status(StatusCode.BadRequest_400).send({
            debug: err,
            success: false,
        });
    });
});
router.get("/health/db/:id", (req, res) => {
    StaffRepository.getTest(req.params.id)
        .then((result) => {
        res.json({ data: result, sucess: true });
    })
        .catch((err) => {
        LoggingService.anyError(err);
        res.status(StatusCode.BadRequest_400).send({
            debug: err,
            success: false,
        });
    });
});
router.get("/countries", (req, res) => {
    const cdnBaseUrl = envConfig.HOSPIMAN_ASSETS_CDN_URL;
    const counstry = countriesJson.map((f) => {
        return {
            name: f.name,
            countryCode: f.countryCode,
            callingCode: f.callingCodes?.[0],
            currencyCode: f.currencies?.[0]?.code,
            flagSvg: cdnBaseUrl ? `${cdnBaseUrl}/country-flag/${f.countryCode.toLowerCase()}.svg` : undefined,
        };
    });
    return BaseController.resSuccess({
        res,
        data: counstry,
    });
});
export const BaseRoutesResolver = router;
//# sourceMappingURL=base.js.map