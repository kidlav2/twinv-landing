"use client";

import { useStudio } from "@/lib/studio/store";
import { STORAGE_KEY } from "@/lib/studio/constants";
import { CrossBorderWarning, PageTitle, TaxNote } from "./widgets";
import { Field, FieldGrid, Select, TextInput } from "./fields";
import { ImportPanel } from "./import-panel";

export function SettingsView() {
  const { state, patchSettings, resetSample } = useStudio();
  const s = state.settings;

  return (
    <div className="flex flex-col gap-10">
      <PageTitle kicker="Studio">Defaults</PageTitle>
      <p className="text-muted max-w-[56ch] text-body-sm">
        Ownership 50/50 is the studio, not the project. Every tax field here is
        a blank you fill — the app never asserts a rate.
      </p>
      <TaxNote />
      <CrossBorderWarning />

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">People</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Founder A name">
              <TextInput
                defaultValue={s.founderAName}
                onBlur={(e) => patchSettings({ founderAName: e.target.value })}
              />
            </Field>
            <Field label="Founder B name">
              <TextInput
                defaultValue={s.founderBName}
                onBlur={(e) => patchSettings({ founderBName: e.target.value })}
              />
            </Field>
            <Field label="Ownership A %">
              <TextInput
                type="number"
                min={0}
                max={100}
                defaultValue={s.ownershipA}
                onBlur={(e) => {
                  const ownershipA = Number(e.target.value) || 0;
                  patchSettings({ ownershipA, ownershipB: 100 - ownershipA });
                }}
              />
            </Field>
            <Field label="Ownership B %">
              <TextInput
                type="number"
                defaultValue={s.ownershipB}
                readOnly
              />
            </Field>
          </FieldGrid>
        </div>
      </section>

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Default rates</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Sales commission %">
              <TextInput
                type="number"
                defaultValue={s.defaultSalesCommissionPct}
                onBlur={(e) =>
                  patchSettings({ defaultSalesCommissionPct: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Studio reserve %">
              <TextInput
                type="number"
                defaultValue={s.defaultStudioReservePct}
                onBlur={(e) =>
                  patchSettings({ defaultStudioReservePct: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="GST/HST reserve %">
              <TextInput
                type="number"
                defaultValue={s.defaultGstHstPct}
                onBlur={(e) =>
                  patchSettings({ defaultGstHstPct: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Income-tax reserve %">
              <TextInput
                type="number"
                defaultValue={s.defaultIncomeTaxReservePct}
                onBlur={(e) =>
                  patchSettings({ defaultIncomeTaxReservePct: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Tax logic">
              <Select
                value={s.defaultTaxMode}
                onChange={(e) =>
                  patchSettings({
                    defaultTaxMode: e.target.value as "inclusive" | "exclusive",
                  })
                }
              >
                <option value="inclusive">Inclusive</option>
                <option value="exclusive">Exclusive</option>
              </Select>
            </Field>
            <Field label="Gateway fee %">
              <TextInput
                type="number"
                step="0.01"
                defaultValue={s.defaultGatewayFeePct}
                onBlur={(e) =>
                  patchSettings({ defaultGatewayFeePct: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Gateway fixed">
              <TextInput
                type="number"
                step="0.01"
                defaultValue={s.defaultGatewayFeeFixed}
                onBlur={(e) =>
                  patchSettings({ defaultGatewayFeeFixed: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </FieldGrid>
        </div>
      </section>

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Presets</h2>
        <div className="mt-6">
          <FieldGrid>
            <Field label="Starter">
              <TextInput
                type="number"
                defaultValue={s.starterPrice}
                onBlur={(e) =>
                  patchSettings({ starterPrice: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Business">
              <TextInput
                type="number"
                defaultValue={s.businessPrice}
                onBlur={(e) =>
                  patchSettings({ businessPrice: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Premium">
              <TextInput
                type="number"
                defaultValue={s.premiumPrice}
                onBlur={(e) =>
                  patchSettings({ premiumPrice: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </FieldGrid>
        </div>
      </section>

      <ImportPanel />

      <section className="studio-card p-6">
        <h2 className="font-display text-heading-sm">Data</h2>
        <p className="text-muted mt-2 text-body-sm">
          Stored in this browser only ({STORAGE_KEY}). Reload sample projects
          to restore the $1,500 / $2,500 / $4,000 walkthroughs.
        </p>
        <button
          type="button"
          className="btn-ghost rounded-btn-sharp mt-6 min-h-11 cursor-pointer border-[1.5px] px-5 text-body-sm"
          onClick={() => {
            if (confirm("Replace the current ledger with sample data?")) {
              resetSample();
            }
          }}
        >
          Reset sample data
        </button>
      </section>
    </div>
  );
}
