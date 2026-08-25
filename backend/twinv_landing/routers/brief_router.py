from typing import Annotated

from fastapi import APIRouter, Depends

from twinv_landing.dto.brief_dto import BriefCreateDTO, BriefResponse
from twinv_landing.service.brief_service import BriefService, get_brief_service

router = APIRouter(prefix="/api", tags=["brief"])


@router.post("/brief", response_model=BriefResponse)
def create_brief(
    payload: BriefCreateDTO,
    service: Annotated[BriefService, Depends(get_brief_service)],
) -> BriefResponse:
    return BriefResponse(brief=service.create(payload))
