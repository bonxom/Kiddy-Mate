from fastapi import APIRouter

from app.modules.parent.application import onboarding_service as service

router = APIRouter()


@router.post("/onboarding/complete")
async def complete_onboarding(
    request: service.OnboardingRequest,
):
    return await service.complete_onboarding(request=request)
