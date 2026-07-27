/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useAuth } from "@/features/auth";
import { updateMe, uploadAvatar } from "@/shared/api/auth";
import { ApiError } from "@/shared/api/http";
import { mapBackendUserToAuthUser } from "@/shared/api/mappers";
import { useCitySelectOptions } from "@/shared/lib/use-city-select-options";
import { EyeIcon, EyeOffIcon, LogoutIcon } from "@/shared/ui/icons";
import { SelectField, type SelectOption } from "@/shared/ui/select-field";
import { Switch } from "@/shared/ui/switch/Switch";

import { maskEmail, PROFILE_ASSETS } from "./constants";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const CREDENTIALS_FIELD_CLASS =
  "box-border flex h-12 min-w-0 w-full items-center rounded-[18px] border-[0.5px] border-solid border-[#CACACA] bg-[#F2F4F7] px-3 py-2 text-[14px] font-normal leading-[1.7] text-[#1A1A1A]";

const CREDENTIALS_BUTTON_CLASS =
  "box-border flex h-12 w-full items-center justify-center rounded-[18px] bg-[#8E8BED] px-4 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-white transition hover:brightness-[0.98]";

const CREDENTIALS_ROW_CLASS = "grid grid-cols-[minmax(0,1fr)_218px] items-center gap-3";

export function ProfileSettingsPanel() {
  const router = useRouter();
  const { user, accessToken, applyUser, logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [cityId, setCityId] = useState("");
  const [pinnedCity, setPinnedCity] = useState<SelectOption | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [hidePersonal, setHidePersonal] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { cityOptions, onCityInputChange, onCityListEndReached } = useCitySelectOptions({
    selectedCityId: cityId,
    pinnedOption: pinnedCity,
  });

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name);
    setCityId(user.cityId ?? "");
    if (user.cityId && user.city) {
      setPinnedCity({ value: user.cityId, label: user.city });
    } else {
      setPinnedCity(null);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    };
  }, [pendingAvatarPreview]);

  if (!user) return null;

  const resetForm = () => {
    setDisplayName(user.name);
    setCityId(user.cityId ?? "");
    if (user.cityId && user.city) {
      setPinnedCity({ value: user.cityId, label: user.city });
    } else {
      setPinnedCity(null);
    }
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatar(null);
    setPendingAvatarPreview(null);
    setError(null);
    setMessage(null);
  };

  const handleAvatarPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Нужен JPEG, PNG, WebP или GIF.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Аватар не больше 2 МБ.");
      return;
    }

    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatar(file);
    setPendingAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!accessToken) {
      setError("Сессия истекла. Войдите снова.");
      return;
    }

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 64) {
      setError("Имя должно быть от 2 до 64 символов.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (pendingAvatar) {
        setIsUploadingAvatar(true);
        const avatarResponse = await uploadAvatar(accessToken, pendingAvatar);
        applyUser(mapBackendUserToAuthUser(avatarResponse.user));
        if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatar(null);
        setPendingAvatarPreview(null);
        setIsUploadingAvatar(false);
      }

      const payload: { displayName: string; cityId?: string } = {
        displayName: trimmedName,
      };
      if (cityId) payload.cityId = cityId;

      const response = await updateMe(accessToken, payload);
      applyUser(mapBackendUserToAuthUser(response.user));
      setMessage("Изменения сохранены.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Не удалось сохранить изменения.",
      );
    } finally {
      setIsSaving(false);
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const avatarPreview = pendingAvatarPreview ?? user.avatarUrl;

  return (
    <section className="flex w-full flex-col gap-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-[589px] flex-col gap-3">
          <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
            Настройки профиля
          </h1>
          <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">
            Управляйте данными аккаунта и настройками приватности.
          </p>
        </div>
        <div className="flex h-12 items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="flex h-12 w-[243px] items-center justify-center rounded-[21px] bg-[#8E8BED] px-6 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-white transition hover:brightness-[0.98] disabled:opacity-60"
          >
            {isSaving ? "Сохраняем…" : "Сохранить изменения"}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={resetForm}
            className="flex h-12 items-center justify-center rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-6 text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A] transition hover:bg-[#FAFAFA] disabled:opacity-60"
          >
            Отмена
          </button>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div className="flex flex-col gap-6 rounded-[31px] bg-[#C8FF00] p-6">
          <h2 className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#626262]">
            Учётные данные
          </h2>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
              Электронная почта
            </p>
            <div className={CREDENTIALS_ROW_CLASS}>
              <div className={CREDENTIALS_FIELD_CLASS}>
                <p className="truncate">{maskEmail(user.email)}</p>
              </div>
              <button type="button" className={CREDENTIALS_BUTTON_CLASS}>
                Поменять почту
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">Пароль</p>
            <div className={CREDENTIALS_ROW_CLASS}>
              <div className={`${CREDENTIALS_FIELD_CLASS} relative pr-12`}>
                <p>•••••••••••••••••••••</p>
                <button
                  type="button"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[13px] w-[19px]" />
                  ) : (
                    <EyeIcon className="h-[13px] w-[19px]" />
                  )}
                </button>
              </div>
              <button type="button" className={CREDENTIALS_BUTTON_CLASS}>
                Поменять пароль
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[31px] bg-white p-6">
          <h2 className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#626262]">
            Основная информация
          </h2>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">Имя</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={64}
              className="h-12 w-full rounded-[18px] border-[0.5px] border-solid border-[#CACACA] bg-[#F2F4F7] px-3 text-[14px] font-normal leading-[1.7] text-[#1A1A1A] outline-none focus:border-[#8E8BED]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">Город</span>
            <SelectField
              value={cityId}
              onChange={(next) => {
                setCityId(next);
                if (!next) {
                  setPinnedCity(null);
                  return;
                }
                const option = cityOptions.find((item) => item.value === next && !item.disabled);
                if (option) setPinnedCity(option);
              }}
              onInputChange={onCityInputChange}
              onListEndReached={onCityListEndReached}
              options={cityOptions}
              placeholder="Выберите город"
              variant="field"
              searchable
              allowCustomValue={false}
              aria-label="Город"
              className="profile-settings-city"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">Аватар</span>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative flex h-[124px] w-full items-center gap-3 overflow-hidden rounded-[18px] border-[0.5px] border-dashed border-[#CACACA] bg-white px-3 text-left"
            >
              <span className="flex size-[98px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.2px] border-solid border-[#CACACA] bg-[#F2F4F7]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="size-full object-cover" />
                ) : (
                  <img src={PROFILE_ASSETS.upload} alt="" className="h-6 w-8" />
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                  {isUploadingAvatar ? "Загрузка…" : "Загрузить фото"}
                </span>
                <span className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#969D9D]">
                  PNG, JPG до 5 МБ
                </span>
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>

          <div className="flex h-12 items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-12 w-[243px] items-center justify-center rounded-[21px] bg-[#8E8BED] px-6 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "Сохраняем…" : "Сохранить изменения"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={resetForm}
              className="flex h-12 items-center justify-center rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white px-6 text-[14px] font-semibold text-[#1A1A1A] disabled:opacity-60"
            >
              Отмена
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[31px] bg-white p-6">
          <h2 className="text-[24px] font-extrabold leading-[1.1] tracking-[-0.003em] text-[#626262]">
            Приватность
          </h2>

          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                Показывать завершённые объявления
              </p>
              <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
                Другие пользователи смогут видеть вашу историю обменов
              </p>
            </div>
            <Switch
              checked={showCompleted}
              onChange={setShowCompleted}
              aria-label="Показывать завершённые объявления"
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-[14px] font-semibold leading-[1.2] tracking-[0.014px] text-[#1A1A1A]">
                Не отображать личные данные на странице
              </p>
              <p className="text-[14px] font-normal leading-[1.7] text-[#1A1A1A]">
                Если вы снимаете видео или стримите, ваши личные данные будут под защитой
              </p>
            </div>
            <Switch
              checked={hidePersonal}
              onChange={setHidePersonal}
              aria-label="Не отображать личные данные на странице"
            />
          </div>
        </div>

        {error ? <p className="text-[14px] font-semibold text-[#FF2056]">{error}</p> : null}
        {message ? <p className="text-[14px] font-semibold text-[#1A1A1A]">{message}</p> : null}

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex h-[67px] w-full items-center justify-center gap-3 rounded-[21px] border-[0.5px] border-solid border-[#CACACA] bg-white text-[14px] font-semibold tracking-[0.014px] text-[#FF2056] transition hover:bg-[#FFF5F7]"
        >
          <LogoutIcon className="h-[18px] w-[18px] text-[#FF2056]" />
          Выйти из аккаунта
        </button>
      </form>
    </section>
  );
}
