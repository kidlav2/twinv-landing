from uuid import uuid4

from twinv_landing.dto.brief_dto import BriefCreateDTO, BriefDTO
from twinv_landing.models.brief import Brief


class BriefMapper:
    @staticmethod
    def to_model(dto: BriefCreateDTO, *, brief_id: str | None = None) -> Brief:
        return Brief(
            brief_id=brief_id or str(uuid4()),
            goal=dto.goal,
            site=dto.site,
            message=dto.message,
            name=dto.name,
            email=dto.email,
        )

    @staticmethod
    def to_dto(model: Brief) -> BriefDTO:
        return BriefDTO.model_validate(model)
